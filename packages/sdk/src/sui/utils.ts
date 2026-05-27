import type { GrpcTypes } from '@mysten/sui/grpc'
import { accountTypeString } from '@typemove/move'

export function getProgrammableTransaction(
  txBlock: GrpcTypes.ExecutedTransaction
): GrpcTypes.ProgrammableTransaction | undefined {
  const data = txBlock.transaction?.kind?.data
  return data?.oneofKind === 'programmableTransaction' ? data.programmableTransaction : undefined
}

export function getMoveCalls(txBlock: GrpcTypes.ExecutedTransaction): GrpcTypes.MoveCall[] {
  const programmableTx = getProgrammableTransaction(txBlock)
  if (!programmableTx) {
    return []
  }

  return programmableTx.commands.flatMap((cmd) => {
    if (cmd.command.oneofKind === 'moveCall') {
      const call = cmd.command.moveCall
      call.package = accountTypeString(call.package ?? '')

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
