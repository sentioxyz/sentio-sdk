import { SuiChainId } from '@sentio/chain'
import { ChainRpc, Endpoints } from '@sentio/runtime'
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

function rpcFor(network: SuiNetwork): ChainRpc {
  return Endpoints.INSTANCE.chainRpc.get(network) ?? { url: getRpcEndpoint(network) }
}

// gRPC client used for the MoveCoder, generated view functions, and exposed to
// processor handlers via `ctx.client`. @typemove/sui v2 is gRPC-only.
export function getClient(network: SuiNetwork): SuiGrpcClient {
  const { url, meta } = rpcFor(network)
  return new SuiGrpcClient({
    network: inferNetworkFromUrl(url) as any,
    baseUrl: url,
    // Metadata from the chain config (e.g. the authority routing key) is sent on every gRPC-web request.
    meta
  })
}

export function getRpcEndpoint(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return 'https://fullnode.testnet.sui.io:443'
  }
  return 'https://fullnode.mainnet.sui.io:443'
}
