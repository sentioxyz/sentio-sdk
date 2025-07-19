import { SuiChainId } from '@sentio/chain'
import { Endpoints } from '@sentio/runtime'
// import { ServerError, Status } from 'nice-grpc'
import { IotaClient } from '@iota/iota-sdk/client'

export type IotaNetwork = SuiChainId
export const IotaNetwork = <const>{
  MAIN_NET: SuiChainId.IOTA_MAINNET,
  TEST_NET: SuiChainId.IOTA_TESTNET
}

export function getClient(network: IotaNetwork): IotaClient {
  let chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (!chainServer) {
    chainServer = getRpcEndpoint(network)
    // throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
  }
  return new IotaClient({ url: chainServer })
}

export function getRpcEndpoint(network: IotaNetwork): string {
  switch (network) {
    case IotaNetwork.TEST_NET:
      return 'https://api.testnet.iota.cafe/'
  }
  return 'https://api.mainnet.iota.cafe/'
}
