import { SuiTransactionResponse, getMoveCallTransaction, SuiTransactionKind } from '@mysten/sui.js'
import { TypeDescriptor } from '../move/index.js'

export function getMoveCalls(tx: SuiTransactionResponse) {
  return tx.certificate.data.transactions.flatMap((tx: SuiTransactionKind) => {
    const call = getMoveCallTransaction(tx)
    if (call) {
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
