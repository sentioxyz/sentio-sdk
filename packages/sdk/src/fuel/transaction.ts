import {
  AbiMap,
  arrayify,
  assembleTransactionSummary,
  bn,
  processGqlReceipt,
  Provider,
  TransactionCoder,
  TransactionSummary
} from 'fuels'

export type FuelFetchConfig = {
  includeFailed?: boolean
}

export const DEFAULT_FUEL_FETCH_CONFIG: FuelFetchConfig = {
  includeFailed: false
}

export type FuelTransaction = TransactionSummary

export function decodeFuelTransaction(gqlTransaction: any, abiMap: AbiMap, provider: Provider): FuelTransaction {
  const rawPayload = arrayify(gqlTransaction.rawPayload)

  const [decodedTransaction] = new TransactionCoder().decode(rawPayload, 0)

  const receipts = gqlTransaction.receipts?.map(processGqlReceipt) || []

  const { gasPerByte, gasPriceFactor, maxInputs, gasCosts } = provider.getChain().consensusParameters

  return assembleTransactionSummary({
    id: gqlTransaction.id,
    receipts,
    transaction: decodedTransaction,
    transactionBytes: rawPayload,
    gqlTransactionStatus: gqlTransaction.status,
    gasPerByte: bn(gasPerByte),
    gasPriceFactor: bn(gasPriceFactor),
    abiMap,
    maxInputs,
    gasCosts
  })
}
