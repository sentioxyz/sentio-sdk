import { ERC20__factory, ERC721__factory } from './builtin/internal/index.js'
import { AddressType, EthFetchConfig, ProcessResult } from '@sentio/protos'

import { PartiallyOptional, PromiseOrVoid } from '../core/index.js'

import { AccountBindOptions } from './bind-options.js'
import { ERC20Processor, TransferEvent as ERC20TransferEvent } from './builtin/erc20.js'
import { ERC721Processor, TransferEvent as ERC721TransferEvent } from './builtin/erc721.js'
import { AccountContext } from './context.js'
import { AddressOrTypeEventFilter, EventsHandler } from './base-processor.js'
import { Block } from 'ethers'
import { AccountProcessorState } from './account-processor-state.js'
import { fixEmptyKey, formatEthData, TypedEvent } from './eth.js'
import { EthChainId } from '@sentio/chain'
import { ServerError, Status } from 'nice-grpc'

const ERC20_INTERFACE = ERC20__factory.createInterface()
const ERC721_INTERFACE = ERC721__factory.createInterface()

export class AccountProcessor {
  config: AccountBindOptions
  eventHandlers: EventsHandler[] = []

  static bind(config: PartiallyOptional<AccountBindOptions, 'network'>): AccountProcessor {
    const processor = new AccountProcessor(config)
    AccountProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  protected constructor(config: PartiallyOptional<AccountBindOptions, 'network'>) {
    this.config = {
      ...config,
      network: config.network || EthChainId.ETHEREUM,
    }
  }

  public getChainId(): EthChainId {
    return this.config.network
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
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
    fetchConfig?: Partial<EthFetchConfig>
  ) {
    return this.onERC(handler, collections, defaultFilter, AddressType.ERC721, fetchConfig)
  }

  private onERC(
    handler: (event: any, ctx: AccountContext) => PromiseOrVoid,
    contractAddresses: string[],
    defaultFilter: (address: string) => AddressOrTypeEventFilter,
    addressType: AddressType,
    fetchConfig?: Partial<EthFetchConfig>
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
    handler: (event: TypedEvent, ctx: AccountContext) => PromiseOrVoid,
    filter: AddressOrTypeEventFilter | AddressOrTypeEventFilter[],
    fetchConfig?: Partial<EthFetchConfig>
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
      fetchConfig: EthFetchConfig.fromPartial(fetchConfig || {}),
      handler: async function (data) {
        const { log, block, transaction, transactionReceipt } = formatEthData(data)
        if (!log) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
        }
        // const log = data.log as { topics: Array<string>; data: string }
        const ctx = new AccountContext(
          chainId,
          config.address,
          data.timestamp,
          data.block as Block,
          log,
          undefined,
          transaction,
          transactionReceipt
        )

        const logParam = log as any as { topics: Array<string>; data: string }
        const parsed = ERC20_INTERFACE.parseLog(logParam)
        if (parsed) {
          const event: TypedEvent = { ...log, name: parsed.name, args: fixEmptyKey(parsed) }
          await handler(event, ctx)
          return ctx.getProcessResult()
        }
        return ProcessResult.fromPartial({})
      },
    })

    return this
  }
}
