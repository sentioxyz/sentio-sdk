// Transform error in more readable format
import { Context } from './context'
import { errors } from 'ethers'

export function transformEtherError(e: Error, ctx: Context<any, any> | undefined): Error {
  let msg = ''
  // @ts-ignore expected error fields
  if (e.code === errors.CALL_EXCEPTION) {
    // @ts-ignore expected error fields
    if (e.data === '0x') {
      if (ctx) {
        msg += [
          // @ts-ignore expected error fields
          "jsonrpc eth_call return '0x' (likely contract not existed): " + e.method + '(' + e.args.join(',') + ')',
          'address: ' + ctx.contract.rawContract.address + ' at chain: ' + ctx.chainId,
          'block: ' + ctx.blockNumber,
          // @ts-ignore expected error fields
          'data: ' + e.transaction.data,
        ].join('\n')
      } else {
        if (ctx) {
          msg += [
            // @ts-ignore expected error fields
            "jsonrpc eth_call return '0x' (likely contract not existed): " + e.method + '(' + e.args.join(',') + ')',
            // @ts-ignore expected error fields
            'data: ' + e.transaction.data,
          ].join('\n')
        }
      }
    }
    return new Error(msg)
  }
  // TODO gracefully handle more errors

  msg = 'ethers call error\n' + e.stack?.toString()
  return new Error(msg)
}
