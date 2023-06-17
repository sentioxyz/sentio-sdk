import { SuiChainId } from '@sentio/chain'
import { Connection, JsonRpcProvider } from '@mysten/sui.js'
import { Endpoints } from '@sentio/runtime'
import { ServerError, Status } from 'nice-grpc'

export type SuiNetwork = SuiChainId
export const SuiNetwork = <const>{
  MAIN_NET: SuiChainId.SUI_MAINNET,
  TEST_NET: SuiChainId.SUI_TESTNET,
  DEV_NET: SuiChainId.SUI_DEVNET,
}

export function getClient(network: SuiNetwork): JsonRpcProvider {
  const chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (!chainServer) {
    throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
  }
  return new JsonRpcProvider(new Connection({ fullnode: chainServer }))
}
