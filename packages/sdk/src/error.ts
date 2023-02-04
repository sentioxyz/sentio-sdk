// Transform error in more readable format
import { ContractContext } from './core/context.js'
import { CallExceptionError } from 'ethers'
// import { errors } from 'ethers/providers'

export class SimpleEthersError extends Error {
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
  if (e instanceof SimpleEthersError) {
    return e
  }

  let msg = ''
  const err = e as CallExceptionError
  if (err.code === 'CALL_EXCEPTION') {
    if (err.data === '0x') {
      if (ctx) {
        msg =
          "jsonrpc eth_call return '0x' (likely contract not existed) at chain " +
          ctx.chainId +
          ': ' +
          JSON.stringify(e)
      } else {
        msg = "jsonrpc eth_call return '0x' (likely contract not existed): " + JSON.stringify(err)
      }
      return new SimpleEthersError(msg, err)
    }
  }

  msg = 'ethers call error\n' + JSON.stringify(e) + '\n' + e.stack?.toString()
  return new Error(msg)
}
