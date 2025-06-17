import {
  Data_FuelBlock,
  Data_FuelTransaction,
  Data_FuelReceipt,
  FuelCallFilter,
  HandleInterval,
  ProcessResult
} from '@sentio/protos'
import { FuelCall, FuelContext, FuelContractContext } from './context.js'
import { bn, Contract, InputType, Interface, JsonAbi, Provider, ReceiptTransfer, ReceiptTransferOut } from 'fuels'
import { FuelNetwork, getProvider } from './network.js'
import {
  decodeFuelTransaction,
  decodeFuelTransactionWithAbi,
  decodeLog,
  DEFAULT_FUEL_FETCH_CONFIG,
  FuelFetchConfig
} from './transaction.js'
import {
  BlockHandler,
  CallHandler,
  ContractTransferFilter,
  FuelBaseProcessor,
  FuelBlock,
  FuelLog,
  FuelProcessorState,
  FuelTransaction,
  ReceiptHandler
} from './types.js'
import { PromiseOrVoid, HandlerOptions } from '../core/index.js'
import { ServerError, Status } from 'nice-grpc'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

export class FuelProcessor<TContract extends Contract> implements FuelBaseProcessor<FuelProcessorConfig> {
  txHandlers: CallHandler<Data_FuelTransaction>[] = []
  blockHandlers: BlockHandler[] = []
  receiptHandlers: ReceiptHandler[] = []

  private provider: Provider

  static bind(config: FuelProcessorConfig): FuelProcessor<any> {
    const processor = new FuelProcessor(config)
    addFuelProcessor(config, processor)
    return processor
  }

  constructor(readonly config: FuelProcessorConfig) {
    return proxyProcessor(this)
  }

  latestGasPrice: string | undefined

  async configure() {
    this.provider = await getProvider(this.config.chainId)
    this.provider.getLatestGasPrice = async () => {
      // avoid flood the endpoint, cache the latest gas price
      if (this.latestGasPrice) {
        return bn(this.latestGasPrice)
      }
      const { latestGasPrice } = await this.provider.operations.getLatestGasPrice()
      this.latestGasPrice = latestGasPrice?.gasPrice
      return bn(latestGasPrice.gasPrice)
    }
    if (this.config.address === '*') {
      return
    }
  }

  private getContract(tx?: FuelTransaction) {
    let contract: undefined | TContract
    let contractId = tx?.transaction?.inputContract?.contractID
    if (!contractId) {
      for (const input of tx?.transaction?.inputs ?? []) {
        if (input.type == InputType.Contract) {
          contractId = input.contractID
          break
        }
      }
    }

    if (contractId) {
      contract = new Contract(contractId, this.config.abi, this.provider) as TContract
    } else if (this.config.address != '*') {
      contract = new Contract(this.config.address, this.config.abi!, this.provider) as TContract
    }
    return contract
  }

  public onTransaction(
    handler: (transaction: FuelTransaction, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<FuelFetchConfig, FuelTransaction>,
    handlerName = getHandlerName()
  ) {
    const callHandler = {
      handlerName,
      handler: async (call: Data_FuelTransaction) => {
        const abiMap = this.config.abi
          ? {
              [this.config.address]: this.config.abi
            }
          : {}
        const tx = await decodeFuelTransactionWithAbi(call.transaction, abiMap, this.provider)

        const ctx = new FuelContractContext(
          this.config.chainId,
          this.getContract(tx),
          this.config.address,
          this.config.name ?? this.config.address,
          call.timestamp || new Date(0),
          tx,
          null
        )
        await handler(tx, ctx)
        return ctx.stopAndGetResult()
      },
      fetchConfig: {
        filters: [],
        ...handlerOptions
      },
      partitionHandler: async (call: Data_FuelTransaction): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const abiMap = this.config.abi
            ? {
                [this.config.address]: this.config.abi
              }
            : {}
          const tx = await decodeFuelTransactionWithAbi(call.transaction, abiMap, this.provider)
          return p(tx)
        }
        return p
      }
    }
    this.txHandlers.push(callHandler)
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
      handlerName: getHandlerName(),
      handler: async (call: Data_FuelTransaction) => {
        try {
          // const contract = new Contract(this.config.address, abi, this.provider)
          const gqlTransaction = call.transaction
          const tx = await decodeFuelTransactionWithAbi(gqlTransaction, { [this.config.address]: abi }, this.provider)

          const ctx = new FuelContext(
            this.config.chainId,
            this.config.address,
            this.config.name ?? this.config.address,
            call.timestamp || new Date(0),
            tx,
            null
          )
          for (const op of tx.operations) {
            for (const call of op.calls || []) {
              if (names.has(call.functionName)) {
                const fn = this.getContract(tx)?.functions[call.functionName]
                if (!fn) {
                  continue
                }
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
          return ProcessResult.fromPartial({})
        }
      },
      fetchConfig: {
        filters: Object.values(filters)
      }
    }
    this.txHandlers.push(callHandler)
    return this
  }

  public onLog<T>(
    logIdFilter: string | string[],
    handler: (logs: FuelLog<T>, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<object, FuelLog<T>>,
    handlerName = getHandlerName()
  ) {
    const logIds = new Set(Array.isArray(logIdFilter) ? logIdFilter : [logIdFilter])

    const logHandler = {
      handlerName,
      handler: async ({ transaction, receiptIndex, timestamp }: Data_FuelReceipt) => {
        try {
          const tx = await decodeFuelTransaction(transaction, this.provider)
          const index = Number(receiptIndex)
          const receipt = tx.receipts[index]
          const log = decodeLog(receipt, this.config.abi)
          if (log) {
            const ctx = new FuelContractContext(
              this.config.chainId,
              this.getContract(tx),
              this.config.address,
              this.config.name ?? this.config.address,
              timestamp || new Date(0),
              tx,
              null
            )
            ctx.setLogIndex(index)
            await handler({ receiptIndex: index, ...log }, ctx)
            return ctx.stopAndGetResult()
          } else {
            console.error(`Log with receipt index ${receiptIndex} not found in tx`)
          }
        } catch (e) {
          console.error(e)
        }

        return ProcessResult.fromPartial({})
      },
      receiptConfig: {
        log: {
          logIds: Array.from(logIds)
        }
      },
      partitionHandler: async (data: Data_FuelReceipt): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          try {
            const tx = await decodeFuelTransaction(data.transaction, this.provider)
            const index = Number(data.receiptIndex)
            const receipt = tx.receipts[index]
            const log = decodeLog(receipt, this.config.abi)
            if (log) {
              return p({ receiptIndex: index, ...log })
            }
          } catch (e) {
            console.error(e)
          }
          return undefined
        }
        return p
      }
    } as ReceiptHandler
    this.receiptHandlers.push(logHandler)
    return this
  }

  /*
   * handle 'Transfer' and 'TransferOut' receipt for a specific contract id
   */
  public onTransfer(
    filter: ContractTransferFilter,
    handler: (transfer: ReceiptTransfer | ReceiptTransferOut, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<object, ReceiptTransfer | ReceiptTransferOut>
  ) {
    const { from, to, assetId } = filter
    const h = {
      handlerName: getHandlerName(),
      handler: async ({ transaction, receiptIndex, timestamp }: Data_FuelReceipt) => {
        try {
          const tx = await decodeFuelTransaction(transaction, this.provider)
          const index = Number(receiptIndex)
          const receipt = tx.receipts[index] as ReceiptTransfer | ReceiptTransferOut
          const ctx = new FuelContractContext(
            this.config.chainId,
            this.getContract(tx),
            this.config.address,
            this.config.name ?? this.config.address,
            timestamp || new Date(0),
            tx,
            null
          )
          ctx.setLogIndex(index)
          await handler(receipt, ctx)
        } catch (e) {
          console.error(e)
        }

        return ProcessResult.fromPartial({})
      },
      receiptConfig: {
        transfer: {
          from,
          to,
          assetId
        }
      },
      partitionHandler: async (data: Data_FuelReceipt): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          try {
            const tx = await decodeFuelTransaction(data.transaction, this.provider)
            const index = Number(data.receiptIndex)
            const receipt = tx.receipts[index] as ReceiptTransfer | ReceiptTransferOut
            return p(receipt)
          } catch (e) {
            console.error(e)
          }
          return undefined
        }
        return p
      }
    } as ReceiptHandler
    this.receiptHandlers.push(h)
    return this
  }

  public onInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    handlerOptions?: HandlerOptions<object, FuelBlock>,
    handlerName = getHandlerName()
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
      handlerName,
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
        const contract = processor.getContract()
        const ctx = new FuelContractContext(
          processor.config.chainId,
          contract,
          processor.config.address,
          processor.config.name ?? processor.config.address,
          data.timestamp || new Date(0),
          null,
          block
        )
        await handler(block, ctx)
        return ctx.stopAndGetResult()
      },
      partitionHandler: async (data: Data_FuelBlock): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const header = data.block
          if (!header) return undefined
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
          return p(block)
        }
        return p
      }
    })
    return this
  }

  public onBlockInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    blockInterval = 250,
    backfillBlockInterval = 1000,
    handlerOptions?: HandlerOptions<object, FuelBlock>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      },
      handlerOptions
    )
  }

  public onTimeInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    handlerOptions?: HandlerOptions<object, FuelBlock>
  ): this {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined,
      handlerOptions
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

export function getOptionsSignature(opts: Omit<FuelProcessorConfig, 'abi'>): string {
  const sig = [opts.address]
  if (opts.chainId) {
    sig.push(opts.chainId)
  }
  if (opts.name) {
    sig.push(opts.name)
  }
  if (opts.startBlock) {
    sig.push(opts.startBlock.toString())
  }
  if (opts.endBlock) {
    sig.push(opts.endBlock.toString())
  }
  return sig.join('_')
}

// Dedup processor that bind multiple times
export function getFuelProcessor(opts: Omit<FuelProcessorConfig, 'abi'>) {
  const sig = getOptionsSignature(opts)
  return FuelProcessorState.INSTANCE.getValue(sig)
}

export function addFuelProcessor(opts: Omit<FuelProcessorConfig, 'abi'>, processor: FuelBaseProcessor<any>) {
  const sig = getOptionsSignature(opts)

  FuelProcessorState.INSTANCE.getOrSetValue(sig, processor)
}
