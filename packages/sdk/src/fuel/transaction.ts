import { AbiMap, assembleTransactionSummary, processGqlReceipt, Provider, TransactionSummary } from '@fuel-ts/account'
import { TransactionCoder } from '@fuel-ts/transactions'
import { bn } from '@fuel-ts/math'
import { arrayify } from '@fuel-ts/utils'

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
  const { gasCosts, maxInputs, gasPerByte, gasPriceFactor } = provider.getChain().consensusParameters
  const blockNumber = gqlTransaction.status?.block?.header?.height
  const gqlTransactionStatus = {
    type: gqlTransaction.status?.__typename,
    ...gqlTransaction.status
  }
  return {
    ...assembleTransactionSummary({
      id: gqlTransaction.id,
      receipts: [],
      transaction: decodedTransaction,
      transactionBytes: rawPayload,
      gqlTransactionStatus,
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

  const { gasCosts, maxInputs, gasPerByte, gasPriceFactor } = provider.getChain().consensusParameters

  const gqlTransactionStatus = {
    type: gqlTransaction.status?.__typename,
    ...gqlTransaction.status
  }
  const blockNumber = gqlTransactionStatus?.block?.header?.height

  return {
    ...assembleTransactionSummary({
      id: gqlTransaction.id,
      receipts,
      transaction: decodedTransaction,
      transactionBytes: rawPayload,
      gqlTransactionStatus,
      gasPerByte: bn(gasPerByte),
      gasPriceFactor: bn(gasPriceFactor),
      abiMap,
      maxInputs,
      gasCosts
    }),
    blockNumber
  }
}
