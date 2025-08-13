import {
  AbiMap,
  arrayify,
  assembleTransactionSummary,
  BigNumberCoder,
  bn,
  Input,
  InputType,
  Interface,
  JsonAbi,
  deserializeReceipt,
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

export async function decodeFuelTransaction(gqlTransaction: any, provider: Provider): Promise<FuelTransaction> {
  const rawPayload = arrayify(gqlTransaction.rawPayload)
  const receipts = gqlTransaction?.status.receipts?.map(deserializeReceipt) || []
  let decodedTransaction: any
  try {
    let [d] = new TransactionCoder().decode(rawPayload, 0)
    decodedTransaction = d
  } catch (e) {
    // If the transaction cannot be decoded, we log the payload in hex and rethrow it
    console.error('Failed to decode transaction payload:', e, 'payload', Buffer.from(rawPayload).toString('hex'))
    throw e
  }
  const { gasCosts, feeParameters, txParameters, baseAssetId } = (await provider.getChain()).consensusParameters
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

export function decodeLog(receipt: any | undefined, abi: JsonAbi) {
  try {
    if (receipt && (receipt.type === ReceiptType.LogData || receipt.type === ReceiptType.Log)) {
      const interfaceToUse = new Interface(abi)
      const data = receipt.type === ReceiptType.Log ? new BigNumberCoder('u64').encode(receipt.val0) : receipt.data
      const logId: string = receipt.rb.toString()
      const [decodedLog] = interfaceToUse.decodeLog(data, logId)
      return { logId, data: decodedLog }
    }
    return null
  } catch (e) {
    console.error(
      'Failed to decode log',
      e,
      'Please make sure you provide the correct abi.',
      e,
      'receipt',
      receipt,
      'abi',
      abi
    )
    throw e
  }
}

export async function decodeFuelTransactionWithAbi(
  gqlTransaction: any,
  abiMap: AbiMap,
  provider: Provider
): Promise<FuelTransaction> {
  const rawPayload = arrayify(gqlTransaction.rawPayload)
  const [decodedTransaction] = new TransactionCoder().decode(rawPayload, 0)

  const receipts = gqlTransaction?.status.receipts?.map(deserializeReceipt) || []

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
    try {
      const log = decodeLog(receipt, abi)
      if (log) {
        logs.push({ ...log, receiptIndex: idx })
      }
    } catch (e) {
      console.warn('Failed to decode log', e)
    }
  })
  const txResponse = new TransactionResponse(
    gqlTransaction.status.transactionId,
    provider,
    await provider.getChainId(),
    {
      main: Object.values(abiMap)[0],
      otherContractsAbis: {}
    }
  )

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
    sender: findSenderFromInputs(decodedTransaction.inputs, (await provider.getChain()).consensusParameters.baseAssetId)
  }
}
