import { StarknetChainId } from '@sentio/chain'
import { Abi } from 'starknet'

export type StarknetProcessorConfig = {
  address: string
  name?: string
  chainId: StarknetChainId | string
  startBlock?: bigint
  endBlock?: bigint
  abi?: Abi
}
