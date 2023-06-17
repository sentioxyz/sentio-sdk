import { normalizeLabels, Labels, BaseContext, RecordMetaData } from '@sentio/sdk'
import { SolanaChainId } from '@sentio/chain'

export class SolanaContext extends BaseContext {
  network: SolanaChainId
  address: string
  programName: string
  blockNumber: bigint

  constructor(
    programName: string,
    network: SolanaChainId,
    address: string,
    slot: bigint,
    baseLabels: Labels | undefined
  ) {
    super(baseLabels)
    this.network = network || SolanaChainId.SOLANA_MAINNET
    this.programName = programName
    this.address = address
    this.blockNumber = slot
  }

  getChainId() {
    return this.network
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.programName,
      blockNumber: this.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO add
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}
