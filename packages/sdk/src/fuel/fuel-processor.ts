import { Data_FuelCall, FuelCallFilter, ProcessResult } from '@sentio/protos'
import { FuelCall, FuelContext } from './context.js'
import { bn, Contract, Interface, JsonAbi, Provider } from 'fuels'
import { FuelNetwork, getRpcEndpoint } from './network.js'
import {
  decodeFuelTransactionWithAbi,
  DEFAULT_FUEL_FETCH_CONFIG,
  FuelFetchConfig,
  FuelTransaction
} from './transaction.js'
import { CallHandler, FuelBaseProcessor, FuelLog, FuelProcessorState } from './types.js'
import { mergeProcessResults } from '@sentio/runtime'

export class FuelProcessor implements FuelBaseProcessor<FuelProcessorConfig> {
  callHandlers: CallHandler<Data_FuelCall>[] = []

  private provider: Provider

  static bind(config: FuelProcessorConfig): FuelProcessor {
    const processor = new FuelProcessor(config)
    FuelProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  constructor(readonly config: FuelProcessorConfig) {}

  async configure() {
    const url = getRpcEndpoint(this.config.chainId)
    this.provider = await Provider.create(url)
  }

  public onTransaction(
    handler: (transaction: FuelTransaction, ctx: FuelContext) => void | Promise<void>,
    config: FuelFetchConfig = DEFAULT_FUEL_FETCH_CONFIG
  ) {
    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        const abiMap = this.config.abi
          ? {
              [this.config.address]: this.config.abi
            }
          : {}
        const tx = decodeFuelTransactionWithAbi(call.transaction, abiMap, this.provider)

        const ctx = new FuelContext(
          this.config.chainId,
          this.config.address,
          this.config.name ?? this.config.address,
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

  public onCall(
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
          const contract = new Contract(this.config.address, abi, this.provider)
          const gqlTransaction = call.transaction
          const tx = decodeFuelTransactionWithAbi(gqlTransaction, { [this.config.address]: abi }, this.provider)

          const ctx = new FuelContext(
            this.config.chainId,
            this.config.address,
            this.config.name ?? this.config.address,
            tx
          )
          for (const op of tx.operations) {
            for (const call of op.calls || []) {
              if (names.has(call.functionName)) {
                const fn = contract.functions[call.functionName]
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
    logIdFilter: number | number[],
    handler: (logs: FuelLog<T>, ctx: FuelContext) => void | Promise<void>
  ) {
    const logIds = new Set(Array.isArray(logIdFilter) ? logIdFilter : [logIdFilter])

    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        try {
          const gqlTransaction = call.transaction
          const tx = decodeFuelTransactionWithAbi(
            gqlTransaction,
            { [this.config.address]: this.config.abi! },
            this.provider
          )

          const results: ProcessResult[] = []
          const logs = (tx.logs || []).filter((log) => logIds.has(log.logId))
          for (const log of logs) {
            const ctx = new FuelContext(
              this.config.chainId,
              this.config.address,
              this.config.name ?? this.config.address,
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
}

export type FuelProcessorConfig = {
  address: string
  name?: string
  chainId: FuelNetwork
  startBlock?: bigint
  endBlock?: bigint
  abi?: JsonAbi
}
