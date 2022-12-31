import { ProcessResult } from '@sentio/protos'
import { SolanaContext } from './solana-context'
import { Instruction } from '@project-serum/anchor'
import { SolanaBindOptions } from './solana-options'
import { ListStateStorage } from '@sentio/base'
import { CHAIN_IDS } from '@sentio/sdk/lib/utils/chain'

type IndexConfigure = {
  startSlot: bigint
  endSlot?: bigint
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
  config: IndexConfigure = { startSlot: 0n }
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
    slot: bigint
  ): ProcessResult {
    const ctx = new SolanaContext(this.contractName, this.network, this.address, slot)
    handler(parsedInstruction, ctx, accounts)
    return ctx.getProcessResult()
  }

  public isBind() {
    return this.address !== null
  }

  public startSlot(startSlot: bigint | number) {
    this.config.startSlot = BigInt(startSlot)
    return this
  }

  public endBlock(endBlock: bigint | number) {
    this.config.endSlot = BigInt(endBlock)
    return this
  }
}
