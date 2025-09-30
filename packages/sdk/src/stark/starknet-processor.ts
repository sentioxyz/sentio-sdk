import { Data_StarknetEvent, ProcessResult } from '@sentio/protos'
import { StarknetChainId } from '@sentio/chain'
import { CallData, events, ParsedEvent, RpcProvider } from 'starknet'
import { StarknetContext } from './context.js'
import { StarknetEvent } from './event.js'
import { ListStateStorage, mergeProcessResults } from '@sentio/runtime'
import { StarknetProcessorConfig } from './types.js'
import { StarknetContractView } from './contract.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { HandlerOptions } from '../core/handler-options.js'

export class StarknetProcessor {
  callHandlers: CallHandler<Data_StarknetEvent>[] = []

  private provider: RpcProvider

  static bind(config: StarknetProcessorConfig): StarknetProcessor {
    const processor = new StarknetProcessor(config)
    StarknetProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  classHash: string

  constructor(readonly config: StarknetProcessorConfig) {
    return proxyProcessor(this)
  }

  async configure() {
    this.provider = new RpcProvider({
      nodeUrl: getRpcEndpoint(this.config.chainId)
    })
    const classHash = await this.provider.getClassHashAt(this.config.address)
    if (!classHash) {
      throw new Error("can't find the class hash defined at " + this.config.address)
    }
    this.classHash = classHash
    if (!this.config.abi) {
      const clazz = await this.provider.getClass(classHash, 'latest')
      this.config.abi = clazz.abi
    }
  }

  public onEvent(
    event: string | string[],
    handler: (events: StarknetEvent<ParsedEvent>, ctx: StarknetContext<StarknetContractView>) => void | Promise<void>,
    handlerOptions?: HandlerOptions<object, StarknetEvent<ParsedEvent>>
  ) {
    const eventFilter = Array.isArray(event) ? event : [event]
    if (!this.config.abi) {
      throw new Error('abi not found')
    }
    const abi = this.config.abi
    const callHandler = {
      handlerName: getHandlerName(),
      handler: async (call: Data_StarknetEvent) => {
        try {
          const eventData = [call.result] as any[]
          const abiEvents = events.getAbiEvents(abi)

          const abiStructs = CallData.getAbiStruct(abi)
          const abiEnums = CallData.getAbiEnum(abi)

          const parsedEvents = events.parseEvents(eventData, abiEvents, abiStructs, abiEnums)
          const results: ProcessResult[] = []
          const { block_hash, block_number, transaction_hash, from_address } = call.result!
          for (let i = 0; i < parsedEvents.length; i++) {
            const ctx = new StarknetContext<StarknetContractView>(
              this.config,
              this.provider,
              block_number,
              block_hash,
              transaction_hash,
              i,
              this.classHash
            )
            const e = new StarknetEvent(from_address, transaction_hash, parsedEvents[i])
            try {
              await handler(e, ctx)
            } catch (e) {
              console.error(e)
            }
            results.push(ctx.stopAndGetResult())
          }
          return mergeProcessResults(results)
        } catch (e) {
          console.error(e)
          return ProcessResult.fromPartial({})
        }
      },
      eventFilter,
      partitionHandler: async (call: Data_StarknetEvent): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          try {
            const eventData = [call.result] as any[]
            const abiEvents = events.getAbiEvents(abi)
            const abiStructs = CallData.getAbiStruct(abi)
            const abiEnums = CallData.getAbiEnum(abi)
            const parsedEvents = events.parseEvents(eventData, abiEvents, abiStructs, abiEnums)
            if (parsedEvents.length > 0) {
              const { from_address, transaction_hash } = call.result!
              const e = new StarknetEvent(from_address, transaction_hash, parsedEvents[0])
              return p(e)
            }
            return undefined
          } catch (e) {
            console.error(e)
            return undefined
          }
        }
        return p
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }
}

export type CallHandler<T> = {
  handlerName: string
  handler: (call: T) => Promise<ProcessResult>
  eventFilter?: string[]
  partitionHandler?: (call: T) => Promise<string | undefined>
}

function getRpcEndpoint(chainId: StarknetChainId | string) {
  switch (chainId) {
    case StarknetChainId.STARKNET_MAINNET:
      return 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/8sD5yitBslIYCPFzSq_Q1ObJHqPlZxFw'
    default:
      return 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/8sD5yitBslIYCPFzSq_Q1ObJHqPlZxFw'
  }
}

export class StarknetProcessorState extends ListStateStorage<StarknetProcessor> {
  static INSTANCE = new StarknetProcessorState()
}

export abstract class AbstractStarknetProcessor {
  private readonly processor: StarknetProcessor
  protected constructor(
    readonly abi: any,
    readonly config: StarknetProcessorConfig
  ) {
    this.processor = new StarknetProcessor(config)
    StarknetProcessorState.INSTANCE.addValue(this.processor)
    return proxyProcessor(this)
  }

  onEvent<T, C>(
    eventName: string,
    structName: string,
    handler: (event: StarknetEvent<T>, ctx: StarknetContext<C>) => Promise<void>
  ) {
    this.processor.onEvent(eventName, async (events, ctx) => {
      const eventData = events.data[structName] as T
      const e = new StarknetEvent<T>(events.caller, events.transactionHash, eventData)
      await handler(e, ctx as StarknetContext<C>)
    })
    return this
  }
}
