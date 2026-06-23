import { SuiChainId } from '@sentio/chain'
import { Endpoints } from '@sentio/runtime'
// import { ConnectError, Code } from '@connectrpc/connect'
import { IotaClient } from '@iota/iota-sdk/client'

export type IotaNetwork = SuiChainId
export const IotaNetwork = <const>{
  MAIN_NET: SuiChainId.IOTA_MAINNET,
  TEST_NET: SuiChainId.IOTA_TESTNET
}

export function getClient(network: IotaNetwork): IotaClient {
  let rpcUrl = Endpoints.INSTANCE.getChainRpcUrl(network)
  if (!rpcUrl) {
    rpcUrl = getRpcEndpoint(network)
    // throw new ConnectError('RPC endpoint not provided', Code.Internal)
  }
  return new IotaClient({ url: rpcUrl })
}

export function getRpcEndpoint(network: IotaNetwork): string {
  switch (network) {
    case IotaNetwork.TEST_NET:
      return 'https://api.testnet.iota.cafe/'
  }
  return 'https://api.mainnet.iota.cafe/'
}
