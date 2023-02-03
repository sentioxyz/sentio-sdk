import { normalizeLabels, Labels, BaseContext, RecordMetaData, CHAIN_IDS } from '@sentio/sdk'

export class SolanaContext extends BaseContext {
  network: string
  address: string
  programName: string
  blockNumber: bigint

  constructor(programName: string, network: string, address: string, slot: bigint) {
    super()
    this.network = network || CHAIN_IDS.SOLANA_MAINNET
    this.programName = programName
    this.address = address
    this.blockNumber = slot
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.programName,
      blockNumber: this.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO add
      logIndex: 0,
      chainId: this.network,
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}
