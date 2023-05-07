import { normalizeLabels, Labels, BaseContext, RecordMetaData, CHAIN_IDS } from '@sentio/sdk'

export class SolanaContext extends BaseContext {
  network: string
  address: string
  programName: string
  blockNumber: bigint

  constructor(programName: string, network: string, address: string, slot: bigint, baseLabels: Labels | undefined) {
    super(baseLabels)
    this.network = network || CHAIN_IDS.SOLANA_MAINNET
    this.programName = programName
    this.address = address
    this.blockNumber = slot
  }

  getChainId(): string {
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
