import { O11yResult } from './gen/processor/protos/processor'
import { SolanaContext } from './context'
import { Connection } from '@solana/web3.js'
import Long from 'long'
import { Instruction } from '@project-serum/anchor'

type IndexConfigure = {
  startSlot: Long
  endSlot?: Long
}

export class SolanaBaseProcessor {
  public instructionHanlderMap: Map<string, (instruction: Instruction, ctx: SolanaContext) => void> = new Map()
  address: string
  endpoint: string
  connection: Connection
  contractName: string
  processInnerInstruction: boolean
  config: IndexConfigure = { startSlot: new Long(0) }
  decodeInstruction: (rawInstruction: string) => Instruction | null
  fromParsedInstruction: (instruction: { type: string, info: any }) => Instruction | null

  constructor(contractName: string, address: string, endpoint: string, processInnerInstruction = false) {
    this.endpoint = endpoint
    this.address = address
    global.PROCESSOR_STATE.solanaProcessors.push(this)
    this.connection = new Connection(endpoint, 'confirmed')
    this.contractName = contractName
    this.processInnerInstruction = processInnerInstruction
  }

  bind(address: string) {
    this.address = address
  }

  innerInstruction(flag: boolean) {
    this.processInnerInstruction = flag
    return this
  } 

  public onInstruction(instructionName: string, handler: (instruction: Instruction, ctx: SolanaContext) => void) {
    if (!this.isBind()) {
      throw new Error("Processor doesn't bind to an address")
    }

    this.instructionHanlderMap.set(instructionName, handler)

    return this
  }

  public handleInstruction(ins: string | { type: string, info: any }): O11yResult | null {
    const ctx = new SolanaContext(this.address)
    let parsedInstruction: Instruction | null = null

    if (ins) {
      if ((ins as { type: string, info: any }).info) {
        if (this.fromParsedInstruction == null) {
          return null
        }
        parsedInstruction = this.fromParsedInstruction(ins as { type: string, info: any })
      } else {
        if (this.decodeInstruction == null) {
          return null
        }
        parsedInstruction = this.decodeInstruction(ins as string)
      }
      if (parsedInstruction) {
        const handler = this.instructionHanlderMap.get(parsedInstruction.name)
        if (handler) {
          handler(parsedInstruction, ctx)
        }
      }
    }
    return {
      gauges: ctx.gauges,
      counters: ctx.counters,
    }
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
