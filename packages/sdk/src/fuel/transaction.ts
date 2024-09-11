import {
  AbiMap,
  arrayify,
  assembleTransactionSummary,
  BigNumberCoder,
  bn,
  Input,
  InputType,
  Interface,
  processGqlReceipt,
  Provider,
  ReceiptType,
  TransactionCoder,
  TransactionResponse
} from 'fuels'
import { FuelLog, FuelTransaction } from './types.js'

export type FuelFetchConfig = {
  includeFailed?: boolean
}

export const DEFAULT_FUEL_FETCH_CONFIG: FuelFetchConfig = {
  includeFailed: false
}

function findSenderFromInputs(inputs: Input[] | undefined, baseAssetId: string): string | undefined {
  for (const input of inputs || []) {
    if (input.type == InputType.Coin && input.assetId == baseAssetId) {
      return input.owner
    }
  }
  return undefined
}

export function decodeFuelTransaction(gqlTransaction: any, provider: Provider): FuelTransaction {
  const rawPayload = arrayify(gqlTransaction.rawPayload)
  const receipts = gqlTransaction?.status.receipts?.map(processGqlReceipt) || []

  const [decodedTransaction] = new TransactionCoder().decode(rawPayload, 0)
  const { gasCosts, feeParameters, txParameters, baseAssetId } = provider.getChain().consensusParameters
  const blockNumber = gqlTransaction.status?.block?.header?.height
  const { gasPriceFactor, gasPerByte } = feeParameters
  const { maxInputs, maxGasPerTx } = txParameters
  const gqlTransactionStatus = {
    type: gqlTransaction.status?.__typename,
    ...gqlTransaction.status
  }
  return {
    ...assembleTransactionSummary({
      id: gqlTransaction.id,
      receipts,
      transaction: decodedTransaction,
      transactionBytes: rawPayload,
      gqlTransactionStatus,
      gasPerByte: bn(gasPerByte),
      gasPriceFactor: bn(gasPriceFactor),
      maxInputs,
      gasCosts,
      gasPrice: bn(gqlTransaction.gasPrice),
      maxGasPerTx,
      baseAssetId
    }),
    blockNumber,
    sender: findSenderFromInputs(decodedTransaction.inputs, baseAssetId)
  }
}

export async function decodeFuelTransactionWithAbi(
  gqlTransaction: any,
  abiMap: AbiMap,
  provider: Provider
): Promise<FuelTransaction> {
  const rawPayload = arrayify(gqlTransaction.rawPayload)
  const [decodedTransaction] = new TransactionCoder().decode(rawPayload, 0)

  const receipts = gqlTransaction?.status.receipts?.map(processGqlReceipt) || []

  // const {
  //   consensusParameters: {
  //     feeParameters: { gasPerByte, gasPriceFactor },
  //     txParameters: { maxInputs, maxGasPerTx },
  //     gasCosts
  //   }
  // } = provider.getChain()
  //
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
      const logId = receipt.val1.toString()
      const [decodedLog] = interfaceToUse.decodeLog(data, logId)
      logs.push({ logId, data: decodedLog, receiptIndex: idx })
    }
  })

  const txResponse = new TransactionResponse(gqlTransaction.status.transactionId, provider, {
    main: Object.values(abiMap)[0],
    otherContractsAbis: {}
  })

  // @ts-ignore - hack
  txResponse.gqlTransaction = {
    ...gqlTransaction,
    status: gqlTransactionStatus
  }
  const summary = await txResponse.getTransactionSummary()

  return {
    /*...assembleTransactionSummary({
      id: gqlTransaction.id,
      receipts,
      transaction: decodedTransaction,
      transactionBytes: rawPayload,
      gqlTransactionStatus,
      gasPerByte: bn(gasPerByte),
      gasPriceFactor: bn(gasPriceFactor),
      abiMap,
      maxInputs,
      gasCosts,
      maxGasPerTx,
      gasPrice: bn(gqlTransaction.gasPrice)
    }),*/
    ...summary,
    blockNumber,
    logs,
    sender: findSenderFromInputs(decodedTransaction.inputs, provider.getChain().consensusParameters.baseAssetId)
  }
}
