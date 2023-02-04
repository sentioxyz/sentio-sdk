import { BlockTag, LogParams } from 'ethers/providers'
import { CallExceptionError, Result } from 'ethers'
import { ContractContext } from './context.js'

export interface EthLog<TArgsArray extends Array<any> = any, TArgsObject = any> extends LogParams {
  args: TArgsArray & TArgsObject & Result
}

export function toBlockTag(a: number | bigint): BlockTag {
  if (typeof a === 'number') {
    return a
  }
  if (a > Number.MAX_SAFE_INTEGER) {
    return '0x' + a.toString(16)
  }
  return Number(a)
}

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
