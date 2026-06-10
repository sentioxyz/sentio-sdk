import { ConnectError, Code } from '@connectrpc/connect'
import { ChainId } from '@sentio/chain'
import { type ProcessResult } from '@sentio/protos'

export type HandlerFunction = (...args: any[]) => Promise<ProcessResult>

interface HandlerEntry {
  id: number
  handler: HandlerFunction
  chainId: ChainId | string
}

export class HandlerRegister {
  private handlerByChain: Map<ChainId | string, HandlerEntry[]> = new Map()

  /**
   * Register a handler function with chain ID and handle type
   * @returns handler ID
   */
  register(handler: HandlerFunction, chainId: ChainId | string): number {
    const entries = this.handlerByChain.get(chainId) || []
    const id = entries.length

    const entry: HandlerEntry = {
      id,
      handler,
      chainId
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

  clear(chainId?: ChainId): void {
    if (chainId) {
      this.handlerByChain.delete(chainId)
    } else {
      this.handlerByChain.clear()
    }
  }
}
