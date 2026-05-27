import { SuiChainId } from '@sentio/chain'
import { Endpoints } from '@sentio/runtime'
// import { ServerError, Status } from 'nice-grpc'
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import { SuiGrpcClient } from '@mysten/sui/grpc'

export type SuiNetwork = SuiChainId
export const SuiNetwork = <const>{
  MAIN_NET: SuiChainId.SUI_MAINNET,
  TEST_NET: SuiChainId.SUI_TESTNET
}

function inferNetworkFromUrl(url: string): string {
  if (url.includes('mainnet')) return 'mainnet'
  if (url.includes('testnet')) return 'testnet'
  if (url.includes('devnet')) return 'devnet'
  if (url.includes('localnet') || url.includes('127.0.0.1') || url.includes('localhost')) return 'localnet'
  return 'custom'
}

function endpointFor(network: SuiNetwork): string {
  return Endpoints.INSTANCE.chainServer.get(network) ?? getRpcEndpoint(network)
}

// Public client exposed to processor handlers via `ctx.client`. Stays
// JSON-RPC so existing Sui processors keep working unchanged.
export function getClient(network: SuiNetwork): SuiJsonRpcClient {
  const chainServer = endpointFor(network)
  return new SuiJsonRpcClient({ url: chainServer, network: inferNetworkFromUrl(chainServer) })
}

// gRPC client used internally for the MoveCoder and generated view
// functions — @typemove/sui v2 is gRPC-only.
export function getGrpcClient(network: SuiNetwork): SuiGrpcClient {
  const chainServer = endpointFor(network)
  return new SuiGrpcClient({ network: inferNetworkFromUrl(chainServer) as any, baseUrl: chainServer })
}

export function getRpcEndpoint(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return 'https://fullnode.testnet.sui.io/'
  }
  return 'https://fullnode.mainnet.sui.io/'
}
