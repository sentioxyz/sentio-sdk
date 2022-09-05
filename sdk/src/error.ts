// Transform error in more readable format
import { Context } from './context'
import { errors } from 'ethers'

class EthersError extends Error {
  constructor(message: string, stack?: string) {
    super(message)
    this.stack = stack
  }

  toString() {
    return this.message + '\n' + this.stack?.toString()
  }
}

export function transformEtherError(e: Error, ctx: Context<any, any> | undefined): Error {
  let msg = ''
  // @ts-ignore expected error fields
  if (e.code === errors.CALL_EXCEPTION) {
    // @ts-ignore expected error fields
    if (e.data === '0x') {
      if (ctx) {
        msg =
          "jsonrpc eth_call return '0x' (likely contract not existed) at chain " +
          ctx.chainId +
          ': ' +
          JSON.stringify(e)
      } else {
        msg = "jsonrpc eth_call return '0x' (likely contract not existed): " + JSON.stringify(e)
      }
    }
    return new EthersError(msg, e.stack)
  }

  if (e instanceof EthersError) {
    return e
  }

  // TODO gracefully handle more errors

  msg = 'ethers call error\n' + e.message + '\n' + e.stack?.toString()
  return new Error(msg)
}
