import http from 'node:http'
import https from 'node:https'
import type { Socket } from 'node:net'
import { FetchRequest } from 'ethers'
import type { FetchGetUrlFunc } from 'ethers'

// Node >= 19 ships `http.globalAgent` as `{ keepAlive: true, timeout: 5000 }`. That agent
// timeout is installed on every NEW socket at creation and stays in force for the whole
// DNS + TCP connect phase: ethers' own `request.setTimeout(300s)` only replaces it once the
// socket has connected (Node defers it with `socket.once('connect', ...)` while connecting).
// So a connect that takes more than 5s — a slow resolver, or the worker's event loop being
// busy when the connect completes — surfaces as an ethers `request timeout`, even though the
// request then goes out anyway and is answered in milliseconds. Idle keep-alive sockets are
// also dropped after those same 5s, so a briefly idle worker reconnects (and re-resolves) for
// almost every call, which is what keeps putting requests into that window.
//
// Use our own agents instead: the connect-phase socket timeout is the RPC deadline, so the
// deadline in boundedTask is the only clock a call can run out on; idle keep-alive sockets
// keep Node's short retention so a server-side idle close never races a reuse.

// How long an idle keep-alive socket is kept before we drop it ourselves. Same value Node's
// global agent uses; well below the idle timeout of any RPC endpoint or proxy in front of one.
export const FREE_SOCKET_IDLE_MS = 5_000

// Default upper bound for a single RPC promise to settle, queue wait included.
// Deliberately above any sane queue+request latency and far below "stuck forever".
// Also the socket timeout for the connect phase of a new connection.
const DEFAULT_RPC_CALL_TIMEOUT_MS = 120_000

// Read per call so tests (and operators) can adjust without a module reload.
export function rpcCallTimeoutMs(): number {
  const n = Number(process.env['RPC_CALL_TIMEOUT_MS'])
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RPC_CALL_TIMEOUT_MS
}

// `timeout` on an Agent doubles as the idle timeout of its free sockets; we want a long connect
// timeout but a short idle retention, so cap the timer again when a socket goes back to the
// free pool. (`keepSocketAlive` is the documented hook Node calls exactly at that point.) The
// base hook already honours a server `Keep-Alive: timeout=N` hint, minus Node's safety buffer,
// whenever that is shorter than the agent timeout — keep whichever is shorter, never lengthen
// it: an idle socket that outlives the server's idle timeout is a reset waiting to happen.
// (@types/node does not declare the hook, hence the structural cast.)
interface KeepSocketAlive {
  keepSocketAlive(socket: Socket): boolean
}

function keepAliveWithShortIdle<T extends http.Agent | https.Agent>(agent: T): T {
  const hooks = agent as unknown as KeepSocketAlive
  const base = hooks.keepSocketAlive.bind(agent)
  hooks.keepSocketAlive = (socket: Socket): boolean => {
    const keep = base(socket)
    if (keep) {
      socket.setTimeout(freeSocketIdleMs(socket.timeout))
    }
    return keep
  }
  return agent
}

// The idle timeout to leave on a freed socket, given the one Node's hook selected for it.
export function freeSocketIdleMs(selected: number | undefined): number {
  return selected && selected > 0 ? Math.min(selected, FREE_SOCKET_IDLE_MS) : FREE_SOCKET_IDLE_MS
}

// Same scheme test ethers' node transport applies (case-insensitive), so a request never lands
// on an agent for the other protocol.
export function isHttpsUrl(url: string): boolean {
  return url.split(':')[0].toLowerCase() === 'https'
}

export function rpcAgentOptions(extra?: http.AgentOptions): http.AgentOptions {
  return { keepAlive: true, scheduling: 'lifo', timeout: rpcCallTimeoutMs(), ...extra }
}

export function createRpcHttpAgent(extra?: http.AgentOptions): http.Agent {
  return keepAliveWithShortIdle(new http.Agent(rpcAgentOptions(extra)))
}

export function createRpcHttpsAgent(extra?: https.AgentOptions): https.Agent {
  return keepAliveWithShortIdle(new https.Agent(rpcAgentOptions(extra)))
}

export interface RpcAgents {
  readonly http: http.Agent
  readonly https: https.Agent
  readonly getUrlFunc: FetchGetUrlFunc
}

let agents: RpcAgents | undefined

// The process-wide agents every FetchRequest the SDK hands to ethers goes through, plus the
// `getUrlFunc` that routes a request to the one matching its scheme. Built lazily so the
// agents pick up RPC_CALL_TIMEOUT_MS from the environment the processor actually runs in.
export function rpcAgents(): RpcAgents {
  if (!agents) {
    const viaHttp = createRpcHttpAgent()
    const viaHttps = createRpcHttpsAgent()
    const overHttp = FetchRequest.createGetUrlFunc({ agent: viaHttp })
    const overHttps = FetchRequest.createGetUrlFunc({ agent: viaHttps })
    agents = {
      http: viaHttp,
      https: viaHttps,
      getUrlFunc: (req, signal) => (isHttpsUrl(req.url) ? overHttps : overHttp)(req, signal)
    }
  }
  return agents
}

// A FetchRequest for `url` whose transport uses the SDK agents. Clones keep the getUrlFunc, so
// this is safe to hand to a JsonRpcProvider, which clones it once per request.
export function rpcFetchRequest(url: string): FetchRequest {
  const req = new FetchRequest(url)
  req.getUrlFunc = rpcAgents().getUrlFunc
  return req
}
