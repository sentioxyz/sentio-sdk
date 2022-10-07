import { AptosContext, BaseContext, Context, SolanaContext, SuiContext } from './context'
import { MetricDescriptor, RecordMetaData } from '@sentio/sdk'
import { APTOS_TESTNET_ID, SOL_MAINMET_ID, SUI_DEVNET_ID } from '../utils/chain'
import { Metric, normalizeLabels, normalizeName } from './meter'

export type Labels = { [key: string]: string }

export function GetRecordMetaData(ctx: BaseContext, metric: Metric | undefined, labels: Labels): RecordMetaData {
  let descriptor = undefined
  if (metric) {
    descriptor = metric.descriptor
    if (metric.usage > 0) {
      // Other setting don't need to be write multiple times
      descriptor = MetricDescriptor.fromPartial({ name: descriptor.name })
    }

    descriptor.name = normalizeName(descriptor.name)
  }

  if (ctx instanceof Context) {
    if (ctx.log) {
      return {
        contractAddress: ctx.contract.rawContract.address,
        blockNumber: ctx.blockNumber,
        transactionIndex: ctx.log.transactionIndex,
        transactionHash: ctx.transactionHash || '',
        logIndex: ctx.log.logIndex,
        chainId: ctx.chainId.toString(),
        descriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    if (ctx.block) {
      return {
        contractAddress: ctx.contract.rawContract.address,
        blockNumber: ctx.blockNumber,
        transactionIndex: -1,
        transactionHash: '',
        logIndex: -1,
        chainId: ctx.chainId.toString(),
        descriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    if (ctx.trace) {
      return {
        contractAddress: ctx.contract.rawContract.address,
        blockNumber: ctx.blockNumber,
        transactionIndex: ctx.trace.transactionPosition,
        transactionHash: ctx.transactionHash || '',
        logIndex: -1,
        chainId: ctx.chainId.toString(),
        descriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
  } else if (ctx instanceof SolanaContext) {
    return {
      contractAddress: ctx.address,
      blockNumber: ctx.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO add
      logIndex: 0,
      chainId: SOL_MAINMET_ID, // TODO set in context
      descriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  } else if (ctx instanceof SuiContext) {
    return {
      contractAddress: ctx.address,
      blockNumber: ctx.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO
      logIndex: 0,
      chainId: SUI_DEVNET_ID, // TODO set in context
      descriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  } else if (ctx instanceof AptosContext) {
    return {
      contractAddress: ctx.address,
      blockNumber: ctx.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO
      logIndex: 0,
      chainId: APTOS_TESTNET_ID, // TODO set in context
      descriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  }
  throw new Error("This can't happen")
}
