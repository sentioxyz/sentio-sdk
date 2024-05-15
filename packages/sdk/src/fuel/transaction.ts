import {
  AbiMap,
  arrayify,
  assembleTransactionSummary,
  BaseAssetId,
  BigNumberCoder,
  bn,
  Input,
  InputType,
  Interface,
  processGqlReceipt,
  Provider,
  ReceiptType,
  TransactionCoder,
  TransactionSummary
} from 'fuels'
import { FuelLog } from './types.js'

export type FuelFetchConfig = {
  includeFailed?: boolean
}

export const DEFAULT_FUEL_FETCH_CONFIG: FuelFetchConfig = {
  includeFailed: false
}

export type FuelTransaction = TransactionSummary & {
  blockNumber?: string
  logs?: FuelLog<any>[]
  sender?: string
}

function findSenderFromInputs(inputs: Input[] | undefined): string | undefined {
  for (const input of inputs || []) {
    if (input.type == InputType.Coin && input.assetId == BaseAssetId) {
      return input.owner
    }
  }
  return undefined
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
    blockNumber,
    sender: findSenderFromInputs(decodedTransaction.inputs)
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

  const abi = Object.values(abiMap)[0]

  const logs = [] as FuelLog<any>[]
  ;(receipts as any[]).forEach((receipt, idx) => {
    if (receipt.type === ReceiptType.LogData || receipt.type === ReceiptType.Log) {
      const interfaceToUse = new Interface(abi)

      const data = receipt.type === ReceiptType.Log ? new BigNumberCoder('u64').encode(receipt.val0) : receipt.data

      const logId = receipt.val1.toNumber()
      const [decodedLog] = interfaceToUse.decodeLog(data, logId)
      logs.push({ logId, data: decodedLog, receiptIndex: idx })
    }
  })

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
    blockNumber,
    logs,
    sender: findSenderFromInputs(decodedTransaction.inputs)
  }
}
