import { Data_SolBlock, Data_SolInstruction, HandleInterval, ProcessResult } from '@sentio/protos'
import { SolanaContext } from './solana-context.js'
import { Instruction } from '@coral-xyz/anchor'
import { SolanaBindOptions, SolanaFetchConfig } from './solana-options.js'
import { ListStateStorage } from '@sentio/runtime'
import { ALL_ADDRESS, Labels, PromiseOrVoid } from '../core/index.js'
import { SolanaChainId } from '@sentio/chain'
import { HandlerOptions } from '../core/handler-options.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { TransactionResponse, BlockResponse } from '@solana/web3.js'

type IndexConfigure = {
  startSlot: bigint
  endSlot?: bigint
}

export interface InstructionCoder {
  decode(ix: Buffer | string, encoding?: 'hex' | 'base58'): Instruction | null
}

export type SolanaInstructionHandler = (instruction: Instruction, ctx: SolanaContext, accounts?: string[]) => void

export interface InstructionHandlerEntry {
  handler: SolanaInstructionHandler
  handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
}

export type SolanaBlockHandler<T> = (block: T, ctx: SolanaContext) => PromiseOrVoid

export interface SolanaBlockHandlerEntry<T> {
  handler: SolanaBlockHandler<T>
  timeIntervalInMinutes?: HandleInterval
  slotInterval?: HandleInterval
  handlerName: string
}

export class SolanaProcessorState extends ListStateStorage<SolanaBaseProcessor> {
  static INSTANCE: SolanaProcessorState = new SolanaProcessorState()
}

export class SolanaBaseProcessor {
  public instructionHandlerMap: Map<string, InstructionHandlerEntry> = new Map()
  public blockHandlers: SolanaBlockHandlerEntry<any>[] = []
  address: string
  endpoint: string
  contractName: string
  baseLabels?: Labels
  network: SolanaChainId
  processInnerInstruction: boolean
  config: IndexConfigure = { startSlot: 0n }
  instructionCoder: InstructionCoder

  decodeInstruction(rawInstruction: string): Instruction | null {
    if (this.instructionCoder) {
      return this.instructionCoder.decode(rawInstruction, 'base58')
    }
    return null
  }

  fromParsedInstruction: (instruction: { type: string; info: any }) => Instruction | null

  constructor(options: SolanaBindOptions) {
    this.address = options.address
    this.contractName = options.name || ''
    this.processInnerInstruction = options.processInnerInstruction || false
    this.network = options.network || SolanaChainId.SOLANA_MAINNET
    if (options.instructionCoder) {
      this.instructionCoder = options.instructionCoder
    }
    if (options.startBlock) {
      this.startSlot(options.startBlock)
    }
    if (options.endBlock) {
      this.endBlock(options.endBlock)
    }
    this.endpoint = options.network || 'https://api.mainnet-beta.solana.com'
    this.baseLabels = options.baseLabels

    SolanaProcessorState.INSTANCE.addValue(this)
  }

  public onInstruction(
    instructionName: string,
    handler: SolanaInstructionHandler,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    this.instructionHandlerMap.set(instructionName, { handler, handlerOptions })
    return this
  }

  public onTimeInterval(
    handler: SolanaBlockHandler<Data_SolBlock>,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240
  ): this {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined
    )
  }

  public onBlockInterval(
    handler: SolanaBlockHandler<Data_SolBlock>,
    blockInterval = 1000,
    backfillBlockInterval = 4000
  ): this {
    return this.onInterval(handler, undefined, {
      recentInterval: blockInterval,
      backfillInterval: backfillBlockInterval
    })
  }

  public onInterval<T>(
    handler: SolanaBlockHandler<T>,
    timeInterval: HandleInterval | undefined,
    slotInterval: HandleInterval | undefined
  ): this {
    this.blockHandlers.push({
      handler: handler,
      timeIntervalInMinutes: timeInterval,
      slotInterval: slotInterval,
      handlerName: getHandlerName()
    })
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

  public getInstructionHandler(parsedInstruction: Instruction): InstructionHandlerEntry | undefined {
    return this.instructionHandlerMap.get(parsedInstruction.name)
  }

  public async handleInstruction(
    parsedInstruction: Instruction,
    accounts: string[],
    handlerEntry: InstructionHandlerEntry,
    data: Data_SolInstruction
  ): Promise<ProcessResult> {
    let transaction: TransactionResponse | undefined = undefined
    if (data.rawTransaction) {
      transaction = JSON.parse(data.rawTransaction) as TransactionResponse
    }

    const ctx = new SolanaContext(
      this.contractName,
      this.network,
      this.address,
      data.slot,
      this.baseLabels,
      transaction
    )
    await handlerEntry.handler(parsedInstruction, ctx, accounts)
    return ctx.stopAndGetResult()
  }

  public async handleBlock(
    rawBlock: Data_SolBlock,
    handlerEntry: SolanaBlockHandlerEntry<BlockResponse>
  ): Promise<ProcessResult> {
    const ctx = new SolanaContext(this.contractName, this.network, this.address, rawBlock.slot, this.baseLabels)
    const block = JSON.parse(rawBlock.rawBlock) as BlockResponse
    await handlerEntry.handler(block, ctx)
    return ctx.stopAndGetResult()
  }

  public async getPartitionKey(
    parsedInstruction: Instruction,
    handlerEntry: InstructionHandlerEntry
  ): Promise<string | undefined> {
    const p = handlerEntry.handlerOptions?.partitionKey
    if (!p) return undefined
    if (typeof p === 'function') {
      return p(parsedInstruction)
    }
    return p
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

export class SolanaGlobalProcessor extends SolanaBaseProcessor {
  static bind(options: Omit<SolanaBindOptions, 'address'>): SolanaGlobalProcessor {
    return new SolanaGlobalProcessor({ ...options, address: ALL_ADDRESS })
  }

  constructor(options: SolanaBindOptions) {
    super(options)
    return proxyProcessor(this)
  }
}
