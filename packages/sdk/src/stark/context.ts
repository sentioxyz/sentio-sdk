import { ChainId } from '@sentio/chain'
import { RecordMetaData } from '@sentio/protos'
import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { Provider, RpcProvider } from 'starknet'
import { StarknetProcessorConfig } from './types.js'
import { Abi } from '@sentio/abi-wan-kanabi'
import { StarknetContractView } from './contract.js'

class AbstractContext extends BaseContext {
  constructor(
    readonly provider: Provider,
    readonly contractAddress: string,
    readonly chainId: ChainId | string,
    readonly blockNumber: number,
    readonly blockHash: string,
    readonly transactionHash: string,
    readonly logIndex: number = -1,
    readonly contractName: string = '',
    readonly abi?: Abi
  ) {
    super({})
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.contractAddress,
      contractName: '',
      blockNumber: BigInt(this.blockNumber),
      transactionIndex: 0,
      transactionHash: this.transactionHash,
      chainId: this.getChainId(),
      name: name,
      logIndex: this.logIndex,
      labels: normalizeLabels(labels)
    }
  }

  getChainId(): ChainId {
    return this.chainId as ChainId
  }
}

export class StarknetContext<CT> extends AbstractContext {
  private _contract: any

  constructor(
    config: StarknetProcessorConfig,
    provider: RpcProvider,
    blockNumber: number,
    blockHash: string,
    transaction_hash: string,
    logIndex: number,
    readonly classHash: string
  ) {
    super(
      provider,
      config.address,
      config.chainId,
      blockNumber,
      blockHash,
      transaction_hash,
      logIndex,
      config.name ?? classHash.slice(0, 8),
      config.abi
    )
  }

  getContract(): CT {
    if (!this.abi) {
      throw new Error('abi not found')
    }

    if (!this._contract) {
      this._contract = new StarknetContractView(this.abi, this.contractAddress, this.provider, this.blockNumber)
    }
    return this._contract as CT
  }
}
