import { SuiChainId } from '@sentio/chain'
import { Endpoints } from '@sentio/runtime'
// import { ServerError, Status } from 'nice-grpc'
import { SuiClient } from '@mysten/sui/client'

export type SuiNetwork = SuiChainId
export const SuiNetwork = <const>{
  MAIN_NET: SuiChainId.SUI_MAINNET,
  TEST_NET: SuiChainId.SUI_TESTNET
}

export function getClient(network: SuiNetwork): SuiClient {
  let chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (!chainServer) {
    chainServer = getRpcEndpoint(network)
    // throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
  }
  return new SuiClient({ url: chainServer })
}

export function getRpcEndpoint(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return 'https://fullnode.testnet.sui.io/'
  }
  return 'https://fullnode.mainnet.sui.io/'
}
