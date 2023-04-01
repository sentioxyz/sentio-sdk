import {
  SuiTransactionBlockResponse,
  MoveCallSuiTransaction,
  getTransactionKind,
  getProgrammableTransaction,
  ProgrammableTransaction,
  SuiTransaction,
} from '@mysten/sui.js'
import { TypeDescriptor } from '../move/index.js'

export function getMoveCalls(txBlock: SuiTransactionBlockResponse) {
  const txKind = getTransactionKind(txBlock)
  if (!txKind) {
    return []
  }
  const programmableTx: ProgrammableTransaction | undefined = getProgrammableTransaction(txKind)
  if (!programmableTx) {
    return []
  }

  return programmableTx.transactions.flatMap((tx: SuiTransaction) => {
    if ('MoveCall' in tx) {
      const call = tx.MoveCall as MoveCallSuiTransaction

      let pkg: string = call.package
      if (call.package.startsWith('0x000000000000000000000000000000000000000000000000000000000000000')) {
        pkg = '0x' + pkg[pkg.length - 1]
      }
      call.package = pkg

      return [call]
    }
    return []
  })
}

export function getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
  if (params.length === 0) {
    return params
  }
  return params.slice(0, params.length - 1)
}
