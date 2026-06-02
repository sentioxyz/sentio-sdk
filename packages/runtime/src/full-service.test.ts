import { describe, test } from 'node:test'
import assert from 'node:assert'
import { RuntimeServicePatcher } from './full-service.js'
import { DataBinding, HandlerType } from './gen/processor/protos/processor.js'

// Verifies the back-compat path for the EthBlock/EthTrace structpb -> raw_*
// migration: once a new driver stops sending the deprecated structpb `block` /
// `trace` fields and only sends `raw_*`, the patcher must reconstruct the
// structpb view from the raw JSON so existing handlers keep working.
describe('RuntimeServicePatcher eth raw_* compatibility', () => {
  const patcher = new RuntimeServicePatcher()

  test('ETH_BLOCK: reconstructs structpb block from rawBlock', () => {
    const block = { number: '0x1', hash: '0xabc' }
    const binding: DataBinding = {
      data: {
        ethBlock: {
          block: undefined,
          rawBlock: JSON.stringify(block)
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    }
    patcher.adjustDataBinding(binding)
    assert.deepEqual(binding.data?.ethBlock?.block, block)
  })

  test('ETH_BLOCK: leaves an already-populated structpb block untouched', () => {
    const block = { number: '0x2' }
    const binding: DataBinding = {
      data: {
        ethBlock: {
          block,
          rawBlock: JSON.stringify({ number: '0xbad' })
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    }
    patcher.adjustDataBinding(binding)
    assert.deepEqual(binding.data?.ethBlock?.block, block)
  })

  test('ETH_TRACE: reconstructs trace and nested fields from raw_*', () => {
    const trace = { type: 'call', action: { from: '0x1' } }
    const transaction = { hash: '0xtx' }
    const transactionReceipt = { status: '0x1' }
    const block = { number: '0x5' }
    const binding: DataBinding = {
      data: {
        ethTrace: {
          trace: undefined,
          timestamp: undefined,
          rawTrace: JSON.stringify(trace),
          rawTransaction: JSON.stringify(transaction),
          rawTransactionReceipt: JSON.stringify(transactionReceipt),
          rawBlock: JSON.stringify(block)
        }
      },
      handlerType: HandlerType.ETH_TRACE,
      handlerIds: [0],
      chainId: '1'
    }
    patcher.adjustDataBinding(binding)
    assert.deepEqual(binding.data?.ethTrace?.trace, trace)
    assert.deepEqual(binding.data?.ethTrace?.transaction, transaction)
    assert.deepEqual(binding.data?.ethTrace?.transactionReceipt, transactionReceipt)
    assert.deepEqual(binding.data?.ethTrace?.block, block)
  })

  test('ETH_TRACE: leaves an already-populated structpb trace untouched', () => {
    const trace = { type: 'call' }
    const binding: DataBinding = {
      data: {
        ethTrace: {
          trace,
          timestamp: undefined,
          rawTrace: JSON.stringify({ type: 'bad' })
        }
      },
      handlerType: HandlerType.ETH_TRACE,
      handlerIds: [0],
      chainId: '1'
    }
    patcher.adjustDataBinding(binding)
    assert.deepEqual(binding.data?.ethTrace?.trace, trace)
  })
})
