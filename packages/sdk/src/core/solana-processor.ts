import { ProcessResult } from '../gen'
import { SolanaContext } from './solana-context'
import Long from 'long'
import { Instruction } from '@project-serum/anchor'
import { SolanaBindOptions } from './solana-options'
import { ListStateStorage } from '../state/state-storage'
import { CHAIN_IDS } from '../utils/chain'

type IndexConfigure = {
  startSlot: Long
  endSlot?: Long
}

export type SolanaInstructionHandler = (instruction: Instruction, ctx: SolanaContext, accounts?: string[]) => void

export class SolanaProcessorState extends ListStateStorage<SolanaBaseProcessor> {
  static INSTANCE: SolanaProcessorState = new SolanaProcessorState()
}

export class SolanaBaseProcessor {
  public instructionHandlerMap: Map<string, SolanaInstructionHandler> = new Map()
  address: string
  endpoint: string
  contractName: string
  network: string
  processInnerInstruction: boolean
  config: IndexConfigure = { startSlot: new Long(0) }
  decodeInstruction: (rawInstruction: string) => Instruction | null
  fromParsedInstruction: (instruction: { type: string; info: any }) => Instruction | null

  constructor(options: SolanaBindOptions) {
    if (options) {
      this.bind(options)
    }
    SolanaProcessorState.INSTANCE.addValue(this)
  }

  bind(options: SolanaBindOptions) {
    this.address = options.address
    this.contractName = options.name || ''
    this.processInnerInstruction = options.processInnerInstruction || false
    this.network = options.network || CHAIN_IDS.SOLANA_MAINNET
    if (options.startBlock) {
      this.startSlot(options.startBlock)
    }
    if (options.endBlock) {
      this.endBlock(options.endBlock)
    }
    this.endpoint = options.network || 'https://api.mainnet-beta.solana.com'
  }

  public onInstruction(instructionName: string, handler: SolanaInstructionHandler) {
    if (!this.isBind()) {
      throw new Error("Processor doesn't bind to an address")
    }

    this.instructionHandlerMap.set(instructionName, handler)

    return this
  }

  public getParsedInstruction(ins: string | { type: string; info: any }): Instruction | null {
    if (ins) {
      if ((ins as { type: string; info: any }).info) {
        return this.fromParsedInstruction ? this.fromParsedInstruction(ins as { type: string; info: any }) : null
      }
      if (this.decodeInstruction != null) {
        return this.decodeInstruction(ins as string)
      }
    }
    return null
  }

  public getInstructionHandler(parsedInstruction: Instruction): SolanaInstructionHandler | undefined {
    return this.instructionHandlerMap.get(parsedInstruction.name)
  }

  // TODO this should be a async function
  public handleInstruction(
    parsedInstruction: Instruction,
    accounts: string[],
    handler: SolanaInstructionHandler,
    slot: Long
  ): ProcessResult {
    const ctx = new SolanaContext(this.contractName, this.network, this.address, slot)
    handler(parsedInstruction, ctx, accounts)
    return ctx.getProcessResult()
  }

  public isBind() {
    return this.address !== null
  }

  public startSlot(startSlot: Long | number) {
    if (typeof startSlot === 'number') {
      startSlot = Long.fromNumber(startSlot)
    }
    this.config.startSlot = startSlot
    return this
  }

  public endBlock(endBlock: Long | number) {
    if (typeof endBlock === 'number') {
      endBlock = Long.fromNumber(endBlock)
    }
    this.config.endSlot = endBlock
    return this
  }
}
