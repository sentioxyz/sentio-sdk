import { SuiTransactionResponse, getMoveCallTransaction, SuiTransactionKind } from '@mysten/sui.js'

export function getMoveCalls(tx: SuiTransactionResponse) {
  return tx.certificate.data.transactions.flatMap((tx: SuiTransactionKind) => {
    const call = getMoveCallTransaction(tx)
    if (call) {
      return [call]
    }
    return []
  })
}
