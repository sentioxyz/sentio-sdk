import { TimeOrBlock } from 'eth/bind-options.js'
import { Block, JsonRpcProvider, EthersError } from 'ethers'

async function getBlockSafely(provider: JsonRpcProvider, blockNumber: number | string): Promise<Block> {
  const block = await provider.getBlock(blockNumber)
  if (!block) {
    throw new Error(`Block ${blockNumber} not found.`)
  }
  return block
}

export async function estimateBlockNumberAtDate(
  provider: JsonRpcProvider,
  targetDate: Date,
  startBlock?: number
): Promise<number | undefined> {
  // Convert JS Date to Unix timestamp in hex
  const timestampHex = '0x' + Math.floor(targetDate.getTime()).toString(16)

  // You can customize these based on how your RPC expects it
  // Ensure rangeStart is hex if defined, else default to "earliest"
  const rangeStart = startBlock !== undefined ? '0x' + startBlock.toString(16) : 'earliest'

  const rangeEnd = 'latest'
  const strategy = 'LE' // or "GE", depending on your use case

  let result
  try {
    result = await provider.send('sentio_estimateBlockNumberAtDate', [timestampHex, rangeStart, rangeEnd, strategy])
  } catch (e) {
    const serverError = e as EthersError
    if (
      serverError.code === 'SERVER_ERROR' ||
      serverError.code === 'UNKNOWN_ERROR' ||
      serverError.code === 'UNSUPPORTED_OPERATION'
    ) {
      return await estimateBlockNumberAtDateSlow(provider, targetDate, startBlock)
    }
    throw e
  }

  if (result === null) {
    return undefined
  }

  return parseInt(result, 16)
}

export async function estimateBlockNumberAtDateSlow(
  provider: JsonRpcProvider,
  targetDate: Date,
  startBlock?: number
): Promise<number | undefined> {
  // Convert the Date object to a Unix timestamp (in seconds)
  const targetTimestamp = Math.floor(targetDate.getTime() / 1000)

  // Step 1: Get the current block number and its timestamp
  const latestBlock = await getBlockSafely(provider, 'latest')
  const earliestBlockNumber = startBlock !== undefined ? startBlock : 0
  const earliestBlock = await getBlockSafely(provider, earliestBlockNumber)

  // Binary search initialization
  let low = earliestBlock.number
  let high = latestBlock.number

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midBlock = await getBlockSafely(provider, mid)

    if (midBlock.timestamp === targetTimestamp) {
      return midBlock.number // Exact match
    } else if (midBlock.timestamp < targetTimestamp) {
      low = mid + 1 // Target is in the upper half
    } else {
      high = mid - 1 // Target is in the lower half
    }
  }

  // If exact timestamp is not found, return undefined
  if (high === -1) return undefined

  const closestBlock = await getBlockSafely(provider, high)
  return closestBlock.number
}

export async function timeOrBlockToBlockNumber(provider: JsonRpcProvider, timeOrBlock: TimeOrBlock): Promise<bigint> {
  if (timeOrBlock.block) {
    return BigInt(timeOrBlock.block)
  }
  if (!timeOrBlock.time) {
    return 0n
  }
  const block = await estimateBlockNumberAtDate(provider, timeOrBlock.time)
  if (!block) {
    throw new Error('Block not found')
  }
  return BigInt(block)
}
