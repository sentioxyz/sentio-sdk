// Transform error in more readable format
import { ContractContext } from './core/context'
import { errors } from 'ethers'

export class EthersError extends Error {
  e: Error

  constructor(message: string, e: Error) {
    super(message)
    this.stack = e.stack
  }

  toString() {
    return this.message + '\n' + this.stack?.toString()
  }
}

export function transformEtherError(e: Error, ctx: ContractContext<any, any> | undefined): Error {
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
    return new EthersError(msg, e)
  }

  if (e instanceof EthersError) {
    return e
  }

  // TODO gracefully handle more errors

  msg = 'ethers call error\n' + e.message + '\n' + e.stack?.toString()
  return new Error(msg)
}
