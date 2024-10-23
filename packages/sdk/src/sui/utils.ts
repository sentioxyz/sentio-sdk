import {
  SuiTransactionBlockResponse,
  MoveCallSuiTransaction,
  ProgrammableTransaction,
  SuiTransaction
} from '@mysten/sui/client'
import { accountTypeString } from '@typemove/move'

export function getMoveCalls(txBlock: SuiTransactionBlockResponse) {
  const txKind = txBlock.transaction?.data.transaction
  if (!txKind) {
    return []
  }
  const programmableTx: ProgrammableTransaction | undefined =
    txKind.kind === 'ProgrammableTransaction' ? txKind : undefined
  if (!programmableTx) {
    return []
  }

  return programmableTx.transactions.flatMap((tx: SuiTransaction) => {
    if ('MoveCall' in tx) {
      const call = tx.MoveCall as MoveCallSuiTransaction
      call.package = accountTypeString(call.package)

      return [call]
    }
    return []
  })
}

// function isHex(value: string): boolean {
//   return /^(0x|0X)?[a-fA-F0-9]+$/.test(value)
// }
//
// function getHexByteLength(value: string): number {
//   return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2
// }
//
// export function isValidSuiAddress(value: string): value is SuiAddress {
//   return isHex(value) && getHexByteLength(value) <= SUI_ADDRESS_LENGTH
// }

// export function validateAndNormalizeAddress(address: string): string {
//   // if (isFrameworkAccount(address)) {
//   //   const n = parseInt(address, 16)
//   //   return `0x${n.toString(16)}`
//   // }
//   if (!isValidSuiAddress(address)) {
//     throw Error('Not valid Address')
//   }
//   return normalizeSuiAddress(address)
// }
