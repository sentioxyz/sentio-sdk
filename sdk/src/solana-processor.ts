import { O11yResult } from './gen/processor/protos/processor'
import { SolanaContext } from './context'
import { Connection, ParsedInstruction } from '@solana/web3.js'
import Long from 'long'
import { Instruction } from '@project-serum/anchor'

type IndexConfigure = {
  startSlot: Long
  endSlot?: Long
}

export class SolanaBaseProcessor {
  public instructionHanlderMap: Map<string, (instruction: Instruction) => Promise<O11yResult>> = new Map()
  address: string
  endpoint: string
  connection: Connection
  contractName: string
  processInnerInstruction: boolean
  config: IndexConfigure = { startSlot: new Long(0) }

  constructor(contractName: string, address: string, endpoint: string, processInnerInstruction: boolean = false) {
    this.endpoint = endpoint
    this.address = address
    if (!globalThis.SolanaProcessors) {
      globalThis.SolanaProcessors = []
    }
    globalThis.SolanaProcessors.push(this)
    this.connection = new Connection(endpoint, 'confirmed')
    this.contractName = contractName
    this.processInnerInstruction = processInnerInstruction
  }

  bind(address: string) {
    this.address = address
  }

  public decodeInstruction(rawInstruction: string): Instruction | null {
    throw new Error('decodeInstruction is not implemented.')
  }

  public fromParsedInstruction(instruction: ParsedInstruction): Instruction | null {
    throw new Error('fromParsedInstruction is not implemented.')
  }

  public onInstruction(instructionName: string, handler: (instruction: Instruction, ctx: SolanaContext) => void) {
    if (!this.isBind()) {
      throw new Error("Processor doesn't bind to an address")
    }

    this.instructionHanlderMap.set(instructionName, async (ins: Instruction) => {
      const ctx = new SolanaContext(this.address)
      // const parsedTransaction = await this.connection.getParsedTransaction(ins)

      if (ins) {
        await handler(ins, ctx)
      }
      return {
        histograms: ctx.histograms,
        counters: ctx.counters,
      }
    })

    return this
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
