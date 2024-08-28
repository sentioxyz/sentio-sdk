import { Block, Provider } from 'ethers'

async function getBlockSafely(provider: Provider, blockNumber: number | string): Promise<Block> {
  const block = await provider.getBlock(blockNumber)
  if (!block) {
    throw new Error(`Block ${blockNumber} not found.`)
  }
  return block
}

export async function estimateBlockNumberAtDate(
  provider: Provider,
  targetDate: Date,
  startBlock?: number
): Promise<number> {
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

  // If exact timestamp is not found, return the closest block number
  const closestBlock = await getBlockSafely(provider, high)
  return closestBlock.number
}
