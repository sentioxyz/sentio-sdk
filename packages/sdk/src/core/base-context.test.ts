import { describe, it } from 'node:test'
import { performance } from 'perf_hooks'
import { BaseContext } from './base-context.js'
import { ChainId } from '@sentio/chain'
import { RecordMetaData } from '@sentio/protos'
import { Labels } from './meter.js'

// Mock implementation of BaseContext for testing
class MockContext extends BaseContext {
  constructor(baseLabels?: Labels) {
    super(baseLabels)
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      blockNumber: 0n,
      contractName: '',
      labels: {},
      logIndex: 0,
      transactionHash: '',
      transactionIndex: 0,
      address: 'test-address',
      chainId: 'ethereum',
      name: name
    }
  }

  getChainId(): ChainId {
    return ChainId.ETHEREUM
  }
}

describe('EventLogger Performance Test', () => {
  it('should demonstrate emit method performance degradation with 1000000 calls', () => {
    const ctx = new MockContext({ project: 'test', version: '1.0' })
    const iterations = 1000000
    const sampleSize = 10000 // Measure every 10000 calls
    const times: number[] = []

    console.log('Starting performance test with', iterations, 'iterations...')

    const totalStartTime = performance.now()
    let batchStartTime: number

    for (let i = 0; i < iterations; i++) {
      // Start timing at the beginning of each batch
      if (i % sampleSize === 0) {
        batchStartTime = performance.now()
      }

      // Call emit with varying data to prevent optimization
      ctx.eventLogger.emit('TestEvent', {
        iteration: i,
        timestamp: Date.now(),
        data: `sample-data-${i}`,
        nested: {
          value: i * 2,
          flag: i % 2 === 0
        }
      })

      // End timing at the end of each batch
      if ((i + 1) % sampleSize === 0) {
        const batchEndTime = performance.now()
        const duration = batchEndTime - batchStartTime!
        times.push(duration)

        // Log progress every 10000 iterations
        const memUsage = process.memoryUsage()
        console.log(
          `Iteration ${i + 1}: ${duration.toFixed(2)}ms for ${sampleSize} calls, Memory: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }
    }

    const totalEndTime = performance.now()
    const totalDuration = totalEndTime - totalStartTime

    // Analyze performance degradation
    const firstBatch = times.slice(0, 10).reduce((a, b) => a + b, 0) / 10
    const lastBatch = times.slice(-10).reduce((a, b) => a + b, 0) / 10
    const degradationFactor = lastBatch / firstBatch

    console.log('\n=== Performance Analysis ===')
    console.log(`Total time: ${totalDuration.toFixed(2)}ms`)
    console.log(`Average time per ${sampleSize} calls:`)
    console.log(`  First 10 batches: ${firstBatch.toFixed(2)}ms`)
    console.log(`  Last 10 batches: ${lastBatch.toFixed(2)}ms`)
    console.log(`  Performance degradation factor: ${degradationFactor.toFixed(2)}x`)

    // Get final memory usage
    const finalMemory = process.memoryUsage()
    console.log(`Final memory usage: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`)

    // Get the accumulated events count
    const result = ctx.stopAndGetResult()
    console.log(`Total events accumulated: ${result.events.length}`)

    // Assert that performance degraded significantly (more than 2x slower)
    if (degradationFactor > 2.0) {
      console.log('⚠️  Performance degradation detected!')
      console.log('   This confirms the emit method gets slower with repeated calls')
    }

    // The test passes regardless, as we're demonstrating the issue
    console.log('Test completed successfully')
  })

  it('should show memory growth pattern', () => {
    const ctx = new MockContext()
    const checkpoints = [1000, 5000, 10000, 25000, 50000]

    console.log('\n=== Memory Growth Pattern ===')

    for (const checkpoint of checkpoints) {
      // Clear previous memory measurements
      if (global.gc) {
        global.gc()
      }

      const startMemory = process.memoryUsage().heapUsed

      for (let i = 0; i < checkpoint; i++) {
        ctx.eventLogger.emit('MemoryTest', {
          id: i,
          payload: `data-${i}`.repeat(10) // Make payload slightly larger
        })
      }

      const endMemory = process.memoryUsage().heapUsed
      const memoryGrowth = (endMemory - startMemory) / 1024 / 1024

      console.log(`After ${checkpoint} calls: +${memoryGrowth.toFixed(2)}MB`)
    }

    const result = ctx.stopAndGetResult()
    console.log(`Final events array length: ${result.events.length}`)
  })
})
