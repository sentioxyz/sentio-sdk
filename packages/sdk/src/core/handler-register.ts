import { ConnectError, Code } from '@connectrpc/connect'
import { ChainId } from '@sentio/chain'
import { type ProcessResult } from '@sentio/protos'

export type HandlerFunction = (...args: any[]) => Promise<ProcessResult>

interface HandlerEntry {
  id: number
  handler: HandlerFunction
  chainId: ChainId | string
  /** Display name, e.g. "TermMaxVaultProcessorTemplate.onTimeInterval". */
  name?: string
}

export class HandlerRegister {
  private handlerByChain: Map<ChainId | string, HandlerEntry[]> = new Map()

  /**
   * Register a handler function with chain ID and handle type
   *
   * `name` is the same handlerName reported in the processor config. Keeping it here
   * as well lets diagnostics say *which* handler something came from: a handler id
   * alone means nothing to the user, and a stack trace does not always include the
   * handler frame — a detached continuation, for instance, has long since lost it.
   *
   * @returns handler ID
   */
  register(handler: HandlerFunction, chainId: ChainId | string, name?: string): number {
    const entries = this.handlerByChain.get(chainId) || []
    const id = entries.length

    const entry: HandlerEntry = {
      id,
      handler,
      chainId,
      name
    }
    entries.push(entry)
    this.handlerByChain.set(chainId, entries)
    return id
  }

  /**
   * Get handler function by ID
   */
  getHandlerById(chainId: ChainId | string, id: number): HandlerFunction {
    const entries = this.handlerByChain.get(chainId)
    if (!entries || id < 0 || id >= entries.length) {
      throw new ConnectError(`Handler with ID ${id} not found.`, Code.Internal)
    }
    return entries[id].handler
  }

  /**
   * Display name of a handler, or undefined if it was registered without one.
   * Never throws — callers are diagnostics paths that must not fail.
   */
  getHandlerName(chainId: ChainId | string, id: number): string | undefined {
    return this.handlerByChain.get(chainId)?.[id]?.name
  }

  clear(chainId?: ChainId): void {
    if (chainId) {
      this.handlerByChain.delete(chainId)
    } else {
      this.handlerByChain.clear()
    }
  }
}
