import { ERC20__factory, ERC721__factory } from './builtin/internal/index.js'
import { AddressType, EthFetchConfig, ProcessResult } from '@sentio/protos'
import { AccountBindOptions } from './bind-options.js'

import { Network, LogParams } from 'ethers/providers'

import { TransferEvent as ERC20TransferEvent, ERC20Processor } from './builtin/erc20.js'
import { TransferEvent as ERC721TransferEvent, ERC721Processor } from './builtin/erc721.js'

import { AccountContext } from './context.js'
import { PromiseOrVoid } from '../promise-or-void.js'
import { AddressOrTypeEventFilter, EventsHandler } from './base-processor.js'
import { Transaction, Block, TransactionReceipt, LogDescription } from 'ethers'
import { AccountProcessorState } from './account-processor-state.js'

const ERC20_INTERFACE = ERC20__factory.createInterface()
const ERC721_INTERFACE = ERC721__factory.createInterface()

export class AccountProcessor {
  config: AccountBindOptions
  eventHandlers: EventsHandler[] = []

  static bind(config: AccountBindOptions): AccountProcessor {
    const processor = new AccountProcessor(config)
    AccountProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  protected constructor(config: AccountBindOptions) {
    this.config = config
    if (typeof this.config.network === 'string') {
      const asInt = parseInt(this.config.network)
      if (Number.isFinite(asInt)) {
        this.config.network = asInt
      }
    }
  }

  public getChainId(): number {
    return Number(Network.from(this.config.network || 1).chainId)
  }

  /**
   * Register custom handler function to process erc20 transfer event to this account
   * @param handler custom handler function
   * @param tokensAddresses all the erc20 token address to watch
   * @param fetchConfig
   */
  onERC20TransferIn(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = [],
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC20(
      handler,
      tokensAddresses,
      (address: string) => ERC721Processor.filters.Transfer(null, this.config.address),
      fetchConfig
    )
  }

  /**
   * Register custom handler function to process erc20 transfer event from this account
   * @param handler custom handler function
   * @param tokensAddresses all the erc20 token address to watch
   * @param fetchConfig
   */
  onERC20TransferOut(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = [],
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC20(
      handler,
      tokensAddresses,
      (address: string) => ERC20Processor.filters.Transfer(this.config.address),
      fetchConfig
    )
  }

  /**
   * Register custom handler function to process erc20 mint for this account
   * @param handler custom handler function
   * @param tokensAddresses all the erc20 token address to watch
   * @param fetchConfig
   */
  onERC20Minted(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = [],
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC20(
      handler,
      tokensAddresses,
      (address: string) =>
        ERC20Processor.filters.Transfer('0x0000000000000000000000000000000000000000', this.config.address),
      fetchConfig
    )
  }

  private onERC20(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = [],
    defaultFilter: (address: string) => AddressOrTypeEventFilter,
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC(handler, tokensAddresses, defaultFilter, AddressType.ERC20, fetchConfig)
  }

  /**
   * Register custom handler function to process ERC721 transfer event to this account
   * @param handler custom handler function
   * @param collections all the ERC721 token address to watch, if not provided then watch all ERC721
   * @param fetchConfig
   */
  onERC721TransferIn(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[],
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC721(
      handler,
      collections,
      (address: string) => ERC721Processor.filters.Transfer(null, this.config.address),
      fetchConfig
    )
  }

  /**
   * Register custom handler function to process ERC721 transfer event from this account
   * @param handler custom handler function
   * @param collections all the ERC721 token address to watch, if not provided then watch all ERC721
   * @param fetchConfig
   */
  onERC721TransferOut(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[],
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC721(
      handler,
      collections,
      (address: string) => ERC721Processor.filters.Transfer(this.config.address),
      fetchConfig
    )
  }

  /**
   * Register custom handler function to process ERC721 mint for this account
   * @param handler custom handler function
   * @param collections all the ERC721 token address to watch, if not provided then watch all ERC721
   * @param fetchConfig
   */
  onERC721Minted(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[] = [],
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC721(
      handler,
      collections,
      (address: string) =>
        ERC721Processor.filters.Transfer('0x0000000000000000000000000000000000000000', this.config.address),
      fetchConfig
    )
  }

  private onERC721(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[],
    defaultFilter: (address: string) => AddressOrTypeEventFilter,
    fetchConfig?: EthFetchConfig
  ) {
    return this.onERC(handler, collections, defaultFilter, AddressType.ERC721, fetchConfig)
  }

  private onERC(
    handler: (event: any, ctx: AccountContext) => PromiseOrVoid,
    contractAddresses: string[],
    defaultFilter: (address: string) => AddressOrTypeEventFilter,
    addressType: AddressType,
    fetchConfig?: EthFetchConfig
  ) {
    const filters = []
    for (const token of contractAddresses) {
      const filter = defaultFilter(this.config.address)
      filter.address = token
      filters.push(filter)
    }
    if (!filters.length) {
      const filter = defaultFilter(this.config.address)
      filter.address = undefined
      filter.addressType = addressType
      filters.push(filter)
    }
    return this.onEvent(handler, filters, fetchConfig)
  }

  protected onEvent(
    handler: (event: LogDescription, ctx: AccountContext) => PromiseOrVoid,
    filter: AddressOrTypeEventFilter | AddressOrTypeEventFilter[],
    fetchConfig?: EthFetchConfig
  ) {
    const chainId = this.getChainId()

    let _filters: AddressOrTypeEventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // let hasVaildConfig = false
    // for (const filter of _filters) {
    //   if (filter.address) {
    //     hasVaildConfig = true
    //     break
    //   }
    //   if (filter.topics && filter.topics.length) {
    //     hasVaildConfig = true
    //     break
    //   }
    // }
    //
    // if (!hasVaildConfig) {
    //   throw Error('no valid config has been found for this account')
    // }

    const config = this.config

    this.eventHandlers.push({
      filters: _filters,
      fetchConfig: fetchConfig || EthFetchConfig.fromPartial({}),
      handler: async function (data) {
        const log = data.log as { topics: Array<string>; data: string }
        const ctx = new AccountContext(
          chainId,
          config.address,
          data.timestamp,
          data.block as Block,
          log as any as LogParams,
          undefined,
          data.transaction as Transaction,
          data.transactionReceipt as TransactionReceipt
        )
        const parsed = ERC20_INTERFACE.parseLog(log)
        if (parsed) {
          await handler(parsed, ctx)
          return ctx.getProcessResult()
        }
        return ProcessResult.fromPartial({})
      },
    })

    return this
  }
}
