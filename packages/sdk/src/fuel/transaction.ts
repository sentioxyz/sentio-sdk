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

export type FuelTransaction = TransactionSummary & {
  blockNumber?: string
}

export function decodeFuelTransaction(gqlTransaction: any, provider: Provider): FuelTransaction {
  const rawPayload = arrayify(gqlTransaction.rawPayload)

  const [decodedTransaction] = new TransactionCoder().decode(rawPayload, 0)
  const { gasPerByte, gasPriceFactor, maxInputs, gasCosts } = provider.getChain().consensusParameters
  const blockNumber = gqlTransaction.status?.block?.header?.height
  return {
    ...assembleTransactionSummary({
      id: gqlTransaction.id,
      receipts: [],
      transaction: decodedTransaction,
      transactionBytes: rawPayload,
      gqlTransactionStatus: gqlTransaction.status,
      gasPerByte: bn(gasPerByte),
      gasPriceFactor: bn(gasPriceFactor),
      maxInputs,
      gasCosts
    }),
    blockNumber
  }
}

export function decodeFuelTransactionWithAbi(gqlTransaction: any, abiMap: AbiMap, provider: Provider): FuelTransaction {
  const rawPayload = arrayify(gqlTransaction.rawPayload)

  const [decodedTransaction] = new TransactionCoder().decode(rawPayload, 0)

  const receipts = gqlTransaction.receipts?.map(processGqlReceipt) || []

  const { gasPerByte, gasPriceFactor, maxInputs, gasCosts } = provider.getChain().consensusParameters
  const blockNumber = gqlTransaction.status?.block?.header?.height

  return {
    ...assembleTransactionSummary({
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
    }),
    blockNumber
  }
}
