import { SuiTransactionResponse, getMoveCallTransaction, MoveCall } from '@mysten/sui.js'

export function getMoveCalls(tx: SuiTransactionResponse) {
  return tx.certificate.data.transactions.flatMap((tx) => {
    const call = getMoveCallTransaction(tx)
    if (call) {
      return [call]
    }
    return []
  })
}
