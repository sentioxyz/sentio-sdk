import { ListStateStorage } from '../state/state-storage'
import { ERC20__factory, ERC721__factory } from '../builtin/internal'
import { AddressType, DummyProvider, ProcessResult } from '@sentio/sdk'
import { AccountBindOptions } from './bind-options'
import { getNetwork } from '@ethersproject/providers'
import { TransferEvent as ERC20TransferEvent } from '../builtin/internal/ERC20'
import { TransferEvent as ERC721TransferEvent } from '../builtin/internal/ERC721'
import { AccountContext } from './context'
import { PromiseOrVoid } from '../promise-or-void'
import { Event } from '@ethersproject/contracts'
import { BytesLike } from '@ethersproject/bytes'
import { AddressOrTypeEventFilter, EventsHandler } from './base-processor'

export class AccountProcessorState extends ListStateStorage<AccountProcessor> {
  static INSTANCE = new AccountProcessorState()
}

const ERC20_CONTRACT = ERC20__factory.connect('', DummyProvider)
const ERC721_CONTRACT = ERC721__factory.connect('', DummyProvider)

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
  }

  public getChainId(): number {
    return getNetwork(this.config.network || 1).chainId
  }

  /**
   * Register custom handler function to process erc20 transfer event to this account
   * @param handler custom handler function
   * @param tokensAddresses all the erc20 token address to watch
   */
  onERC20TransferIn(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = []
  ) {
    return this.onERC20(handler, tokensAddresses, (address: string) =>
      ERC20_CONTRACT.filters.Transfer(null, this.config.address)
    )
  }

  /**
   * Register custom handler function to process erc20 transfer event from this account
   * @param handler custom handler function
   * @param tokensAddresses all the erc20 token address to watch
   */
  onERC20TransferOut(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = []
  ) {
    return this.onERC20(handler, tokensAddresses, (address: string) =>
      ERC20_CONTRACT.filters.Transfer(this.config.address)
    )
  }

  /**
   * Register custom handler function to process erc20 mint for this account
   * @param handler custom handler function
   * @param tokensAddresses all the erc20 token address to watch
   */
  onERC20Minted(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = []
  ) {
    return this.onERC20(handler, tokensAddresses, (address: string) =>
      ERC20_CONTRACT.filters.Transfer('0x0000000000000000000000000000000000000000', this.config.address)
    )
  }

  private onERC20(
    handler: (event: ERC20TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    tokensAddresses: string[] = [],
    defaultFilter: (address: string) => AddressOrTypeEventFilter
  ) {
    return this.onERC(handler, tokensAddresses, defaultFilter, AddressType.ERC20)
  }

  /**
   * Register custom handler function to process ERC721 transfer event to this account
   * @param handler custom handler function
   * @param collections all the ERC721 token address to watch, if not provided then watch all ERC721
   */
  onERC721TransferIn(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[]
  ) {
    return this.onERC721(handler, collections, (address: string) =>
      ERC721_CONTRACT.filters.Transfer(null, this.config.address)
    )
  }

  /**
   * Register custom handler function to process ERC721 transfer event from this account
   * @param handler custom handler function
   * @param collections all the ERC721 token address to watch, if not provided then watch all ERC721
   */
  onERC721TransferOut(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[]
  ) {
    return this.onERC721(handler, collections, (address: string) =>
      ERC721_CONTRACT.filters.Transfer(this.config.address)
    )
  }

  /**
   * Register custom handler function to process ERC721 mint for this account
   * @param handler custom handler function
   * @param collections all the ERC721 token address to watch, if not provided then watch all ERC721
   */
  onERC721Minted(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[] = []
  ) {
    return this.onERC721(handler, collections, (address: string) =>
      ERC721_CONTRACT.filters.Transfer('0x0000000000000000000000000000000000000000', this.config.address)
    )
  }

  private onERC721(
    handler: (event: ERC721TransferEvent, ctx: AccountContext) => PromiseOrVoid,
    collections: string[],
    defaultFilter: (address: string) => AddressOrTypeEventFilter
  ) {
    return this.onERC(handler, collections, defaultFilter, AddressType.ERC721)
  }

  private onERC(
    handler: (event: any, ctx: AccountContext) => PromiseOrVoid,
    contractAddresses: string[],
    defaultFilter: (address: string) => AddressOrTypeEventFilter,
    addressType: AddressType
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
    return this.onEvent(handler, filters)
  }

  protected onEvent(
    handler: (event: Event, ctx: AccountContext) => PromiseOrVoid,
    filter: AddressOrTypeEventFilter | AddressOrTypeEventFilter[]
  ) {
    const chainId = this.getChainId()

    let _filters: AddressOrTypeEventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    let hasVaildConfig = false
    for (const filter of _filters) {
      if (filter.address) {
        hasVaildConfig = true
        break
      }
      if (filter.topics && filter.topics.length) {
        hasVaildConfig = true
        break
      }
    }

    if (!hasVaildConfig) {
      throw Error('no valid config has been found for this account')
    }

    const config = this.config

    this.eventHandlers.push({
      filters: _filters,
      handler: async function (log) {
        const ctx = new AccountContext(chainId, config.address, undefined, log)
        // let event: Event = <Event>deepCopy(log);
        const event: Event = <Event>log
        const parsed = ERC20_CONTRACT.interface.parseLog(log)
        if (parsed) {
          event.args = parsed.args
          event.decode = (data: BytesLike, topics?: Array<any>) => {
            return ERC20_CONTRACT.interface.decodeEventLog(parsed.eventFragment, data, topics)
          }
          event.event = parsed.name
          event.eventSignature = parsed.signature

          // TODO fix this bug
          await handler(event, ctx)
          return ctx.getProcessResult()
        }
        return ProcessResult.fromPartial({})
      },
    })

    return this
  }
}
