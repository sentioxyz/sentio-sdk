import { Data_FuelBlock, Data_FuelCall, FuelCallFilter, HandleInterval, ProcessResult } from '@sentio/protos'
import { FuelCall, FuelContext, FuelContractContext } from './context.js'
import { bn, Contract, Interface, JsonAbi, Provider } from 'fuels'
import { FuelNetwork, getRpcEndpoint } from './network.js'
import { decodeFuelTransactionWithAbi, DEFAULT_FUEL_FETCH_CONFIG, FuelFetchConfig } from './transaction.js'
import {
  BlockHandler,
  CallHandler,
  FuelBaseProcessor,
  FuelBlock,
  FuelLog,
  FuelProcessorState,
  FuelTransaction
} from './types.js'
import { mergeProcessResults } from '@sentio/runtime'
import { PromiseOrVoid } from '../core/index.js'
import { ServerError, Status } from 'nice-grpc'

export class FuelProcessor<TContract extends Contract> implements FuelBaseProcessor<FuelProcessorConfig> {
  callHandlers: CallHandler<Data_FuelCall>[] = []
  blockHandlers: BlockHandler[] = []

  private provider: Provider
  private contract: TContract

  static bind(config: FuelProcessorConfig): FuelProcessor<any> {
    const processor = new FuelProcessor(config)
    FuelProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  constructor(readonly config: FuelProcessorConfig) {}

  latestGasPrice: string | undefined
  async configure() {
    const url = getRpcEndpoint(this.config.chainId)
    this.provider = await Provider.create(url)
    this.provider.getLatestGasPrice = async () => {
      // avoid flood the endpoint, cache the latest gas price
      if (this.latestGasPrice) {
        return bn(this.latestGasPrice)
      }
      const { latestGasPrice } = await this.provider.operations.getLatestGasPrice()
      this.latestGasPrice = latestGasPrice?.gasPrice
      return bn(latestGasPrice.gasPrice)
    }

    this.contract = new Contract(this.config.address, this.config.abi!, this.provider) as TContract
  }

  public onTransaction(
    handler: (transaction: FuelTransaction, ctx: FuelContractContext<TContract>) => void | Promise<void>,
    config: FuelFetchConfig = DEFAULT_FUEL_FETCH_CONFIG
  ) {
    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        const abiMap = this.config.abi
          ? {
              [this.config.address]: this.config.abi
            }
          : {}
        const tx = await decodeFuelTransactionWithAbi(call.transaction, abiMap, this.provider)

        const ctx = new FuelContractContext(
          this.config.chainId,
          this.contract,
          this.config.address,
          this.config.name ?? this.config.address,
          call.timestamp || new Date(0),
          tx
        )
        await handler(tx, ctx)
        return ctx.stopAndGetResult()
      },
      fetchConfig: {
        filters: [],
        ...config
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }

  // hide onCall for now
  private onCall(
    nameFilter: string | string[],
    handler: (call: FuelCall, ctx: FuelContext) => void | Promise<void>,
    config: FuelFetchConfig = DEFAULT_FUEL_FETCH_CONFIG
  ) {
    const names = new Set(Array.isArray(nameFilter) ? nameFilter : [nameFilter])

    if (!this.config.abi) {
      throw new Error('ABI must be provided to use onCall')
    }
    const abi = this.config.abi

    const filters: Record<string, FuelCallFilter> = {}
    const abiInterface = new Interface(abi)
    for (const name of names) {
      try {
        const func = abiInterface.functions[name]
        const filter = bn(func.selector, 'hex').toString()
        filters[func.name] = {
          function: filter,
          includeFailed: !!config.includeFailed
        }
      } catch (e) {
        console.error(e)
      }
    }

    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        try {
          // const contract = new Contract(this.config.address, abi, this.provider)
          const gqlTransaction = call.transaction
          const tx = await decodeFuelTransactionWithAbi(gqlTransaction, { [this.config.address]: abi }, this.provider)

          const ctx = new FuelContext(
            this.config.chainId,
            this.config.address,
            this.config.name ?? this.config.address,
            call.timestamp || new Date(0),
            tx
          )
          for (const op of tx.operations) {
            for (const call of op.calls || []) {
              if (names.has(call.functionName)) {
                const fn = this.contract.functions[call.functionName]
                const args = Object.values(call.argumentsProvided || {})
                const scope = fn(...args)
                const invocationResult = new FuelCall(scope, tx, false, call.argumentsProvided, tx.logs)
                await handler(invocationResult, ctx)
              }
            }
          }

          return ctx.stopAndGetResult()
        } catch (e) {
          console.error(e)
          return {
            gauges: [],
            counters: [],
            events: [],
            exports: [],
            states: {
              configUpdated: false
            }
          }
        }
      },
      fetchConfig: {
        filters: Object.values(filters)
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }

  public onLog<T>(
    logIdFilter: string | string[],
    handler: (logs: FuelLog<T>, ctx: FuelContractContext<TContract>) => void | Promise<void>
  ) {
    const logIds = new Set(Array.isArray(logIdFilter) ? logIdFilter : [logIdFilter])

    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        try {
          const gqlTransaction = call.transaction
          const tx = await decodeFuelTransactionWithAbi(
            gqlTransaction,
            { [this.config.address]: this.config.abi! },
            this.provider
          )

          const results: ProcessResult[] = []
          const logs = (tx.logs || []).filter((log) => logIds.has(log.logId))
          for (const log of logs) {
            const ctx = new FuelContractContext(
              this.config.chainId,
              this.contract,
              this.config.address,
              this.config.name ?? this.config.address,
              call.timestamp || new Date(0),
              tx
            )
            ctx.setLogIndex(log.receiptIndex)
            await handler(log, ctx)
            results.push(ctx.stopAndGetResult())
          }
          return mergeProcessResults(results)
        } catch (e) {
          console.error(e)
          return {
            gauges: [],
            counters: [],
            events: [],
            exports: [],
            states: {
              configUpdated: false
            }
          }
        }
      },
      logConfig: {
        logIds: Array.from(logIds)
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }

  public onInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined
    // fetchConfig: Partial<FuelFetchConfig> | undefined
  ): this {
    if (timeInterval) {
      if (timeInterval.backfillInterval < timeInterval.recentInterval) {
        timeInterval.backfillInterval = timeInterval.recentInterval
      }
    }

    const processor = this

    this.blockHandlers.push({
      blockInterval,
      timeIntervalInMinutes: timeInterval,
      handler: async function (data: Data_FuelBlock) {
        const header = data.block
        if (!header) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }

        const block: FuelBlock = {
          id: header.id,
          height: bn(header.height),
          time: header.time,
          header: {
            applicationHash: header.applicationHash,
            daHeight: bn(header.daHeight),
            eventInboxRoot: header.eventInboxRoot,
            messageOutboxRoot: header.messageOutboxRoot,
            prevRoot: header.prevRoot,
            stateTransitionBytecodeVersion: header.stateTransitionBytecodeVersion,
            transactionsCount: header.transactionsCount,
            transactionsRoot: header.transactionsRoot
          }
        }

        const ctx = new FuelContractContext(
          processor.config.chainId,
          processor.contract,
          processor.config.address,
          processor.config.name ?? processor.config.address,
          data.timestamp || new Date(0),
          null
        )
        await handler(block, ctx)
        return ctx.stopAndGetResult()
      }
    })
    return this
  }

  public onBlockInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    blockInterval = 250,
    backfillBlockInterval = 1000
    // fetchConfig?: Partial<FuelFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      }
      // fetchConfig,
    )
  }

  public onTimeInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240
    // fetchConfig?: Partial<FuelFetchConfig>,
  ): this {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined
      // fetchConfig
    )
  }
}

export type FuelProcessorConfig = {
  address: string
  name?: string
  chainId: FuelNetwork
  startBlock?: bigint
  endBlock?: bigint
  abi: JsonAbi
}
