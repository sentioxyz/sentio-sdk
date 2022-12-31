import { BaseContext } from './base-context'
import { Labels } from './metadata'
import { RecordMetaData } from '@sentio/sdk'
import { CHAIN_IDS } from '../utils/chain'
import { normalizeLabels } from './meter'

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
