import { normalizeLabels, Labels, BaseContext, RecordMetaData } from '../index.js'
import { SolanaChainId } from '@sentio/chain'
import { TransactionResponse } from '@solana/web3.js'

export class SolanaContext extends BaseContext {
  network: SolanaChainId
  address: string
  programName: string
  blockNumber: bigint
  transaction?: TransactionResponse

  constructor(
    programName: string,
    network: SolanaChainId,
    address: string,
    slot: bigint,
    baseLabels: Labels | undefined,
    transaction?: TransactionResponse
  ) {
    super(baseLabels)
    this.network = network || SolanaChainId.SOLANA_MAINNET
    this.programName = programName
    this.address = address
    this.blockNumber = slot
    this.transaction = transaction
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
      transactionHash: this.transaction?.transaction.signatures[0] || '',
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels)
    }
  }
}
