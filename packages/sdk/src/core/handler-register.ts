import { ServerError, Status } from 'nice-grpc'
import { ChainId } from '@sentio/chain'
import { ProcessResult } from '@sentio/protos'

export type HandlerFunction = (...args: any[]) => Promise<ProcessResult>

interface HandlerEntry {
  id: number
  handler: HandlerFunction
  chainId: ChainId | string
}

const chainToNumber: Map<string, number> = new Map()
const numberToChain: Map<number, string> = new Map()

for (const chainId of Object.values(ChainId)) {
  const num = chainToNumber.size + 1
  chainToNumber.set(chainId, num)
  numberToChain.set(num, chainId)
}

const MAX_HANDLER_PER_CHAIN = 1000000 // Maximum handlers per chain

export class HandlerRegister {
  private handlerByChain: Map<number, HandlerEntry[]> = new Map()
  private handlers: Map<number, HandlerEntry> = new Map()

  /**
   * Register a handler function with chain ID and handle type
   * @returns handler ID
   */
  register(handler: HandlerFunction, chainId: ChainId | string): number {
    const chainNum = chainToNumber.get(chainId) || 0
    const entries = this.handlerByChain.get(chainNum) || []

    const len = entries.length
    const id = chainNum * MAX_HANDLER_PER_CHAIN + len + 1 // Use the first 32 bits for chain ID, next bits for index

    const entry: HandlerEntry = {
      id,
      handler,
      chainId
    }
    entries.push(entry)
    this.handlerByChain.set(chainNum, entries)
    this.handlers.set(id, entry)

    return id
  }

  /**
   * Get handler function by ID
   */
  getHandlerById(id: number): HandlerFunction {
    const entry = this.handlers.get(id)
    if (!entry) {
      throw new ServerError(Status.INTERNAL, `Handler with ID ${id} not found.`)
    }
    return entry.handler
  }

  clear(chainId?: ChainId): void {
    if (chainId) {
      const chainNum = chainToNumber.get(chainId)
      if (chainNum !== undefined) {
        const chainHandlers = this.handlerByChain.get(chainNum)
        if (chainHandlers) {
          for (const entry of chainHandlers) {
            this.handlers.delete(entry.id)
          }
        }
        this.handlerByChain.delete(chainNum)
      }
    } else {
      this.handlerByChain.clear()
      this.handlers.clear()
    }
  }
}
