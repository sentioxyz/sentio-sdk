export type FetchFn = (input: string, init: RequestInit) => Promise<Response>

export async function callIndexerRpc<T>(
  url: string,
  method: string,
  params: unknown[],
  fetchFn: FetchFn = fetch
): Promise<T> {
  const res = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  if (!res.ok) {
    throw new Error(`${method} HTTP ${res.status}`)
  }
  const json = (await res.json()) as { result?: T; error?: { code: number; message: string } }
  if (json.error) {
    throw new Error(`${method}: ${json.error.message}`)
  }
  return json.result as T
}

export interface ForwardRequestRpc {
  from: string
  payer: string
  target: string
  gas: string
  nonceKey: string
  nonceValue: number
  deadline: number
  maxFee: string
  data: string
  signature: string
}

export interface SubmitForwardResponse {
  txHash: string
  blockNumber: number
  relayError?: { error: string; rawData: string }
}

export async function rpcEstimateRelayFee(url: string, target: string, selector: string): Promise<bigint> {
  const raw = await callIndexerRpc<string>(url, 'sentio_estimateRelayFee', [target, selector])
  return BigInt(raw)
}

export async function rpcGetRelayNonce(url: string, user: string, nonceKey: bigint): Promise<bigint> {
  const raw = await callIndexerRpc<number>(url, 'sentio_getRelayNonce', [user, nonceKey.toString(10)])
  return BigInt(raw)
}

export async function rpcSubmitForwardRequest(url: string, req: ForwardRequestRpc): Promise<SubmitForwardResponse> {
  return callIndexerRpc<SubmitForwardResponse>(url, 'sentio_submitForwardRequest', [req])
}
