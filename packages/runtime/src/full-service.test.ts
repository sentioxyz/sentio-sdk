import { describe, test } from 'node:test'
import assert from 'node:assert'
import { RuntimeServicePatcher } from './full-service.js'
import { DataBinding, HandlerType, ProcessConfigResponse } from './gen/processor/protos/processor.js'
import { DeepPartial } from '@sentio/protos'

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

// Verifies the back-compat path for the SolInstruction structpb -> raw_parsed
// migration: once a new driver stops sending the deprecated structpb `parsed`
// field and only sends `raw_parsed`, the patcher must reconstruct the structpb
// view from the raw JSON so existing instruction handlers keep working.
describe('RuntimeServicePatcher solana raw_* compatibility', () => {
  const patcher = new RuntimeServicePatcher()

  test('SOL_INSTRUCTION: reconstructs parsed from rawParsed', () => {
    const parsed = { type: 'transfer', info: { lamports: 1 } }
    const binding: DataBinding = {
      data: {
        solInstruction: {
          instructionData: '',
          slot: BigInt(0),
          programAccountId: 'prog',
          accounts: [],
          parsed: undefined,
          rawParsed: JSON.stringify(parsed)
        }
      },
      handlerType: HandlerType.SOL_INSTRUCTION,
      handlerIds: [0],
      chainId: 'sol-mainnet'
    }
    patcher.adjustDataBinding(binding)
    assert.deepEqual(binding.data?.solInstruction?.parsed, parsed)
  })

  test('SOL_INSTRUCTION: leaves an already-populated parsed untouched', () => {
    const parsed = { type: 'transfer' }
    const binding: DataBinding = {
      data: {
        solInstruction: {
          instructionData: '',
          slot: BigInt(0),
          programAccountId: 'prog',
          accounts: [],
          parsed,
          rawParsed: JSON.stringify({ type: 'bad' })
        }
      },
      handlerType: HandlerType.SOL_INSTRUCTION,
      handlerIds: [0],
      chainId: 'sol-mainnet'
    }
    patcher.adjustDataBinding(binding)
    assert.deepEqual(binding.data?.solInstruction?.parsed, parsed)
  })
})

// Verifies the config-direction back-compat for move resource/object change handlers:
// SDKs before the plural `types` field (< 3.4.1) only set the deprecated singular
// `type`. The latest driver reads `types` only, so patchConfig must back-fill it.
describe('RuntimeServicePatcher move resource change type -> types compatibility', () => {
  const patcher = new RuntimeServicePatcher()

  test('contractConfigs: back-fills types from the deprecated singular type', () => {
    const config: DeepPartial<ProcessConfigResponse> = {
      contractConfigs: [{ moveResourceChangeConfigs: [{ type: '0x2::coin::Coin', handlerId: 0, handlerName: 'h' }] }]
    }
    patcher.patchConfig(config)
    assert.deepEqual(config.contractConfigs?.[0]?.moveResourceChangeConfigs?.[0]?.types, ['0x2::coin::Coin'])
  })

  test('accountConfigs: back-fills types from the deprecated singular type', () => {
    const config: DeepPartial<ProcessConfigResponse> = {
      accountConfigs: [
        { moveResourceChangeConfigs: [{ type: '0x1::aptos_coin::AptosCoin', handlerId: 0, handlerName: 'h' }] }
      ]
    }
    patcher.patchConfig(config)
    assert.deepEqual(config.accountConfigs?.[0]?.moveResourceChangeConfigs?.[0]?.types, ['0x1::aptos_coin::AptosCoin'])
  })

  test('leaves already-populated types untouched', () => {
    const config: DeepPartial<ProcessConfigResponse> = {
      contractConfigs: [
        { moveResourceChangeConfigs: [{ type: 'old', types: ['new'], handlerId: 0, handlerName: 'h' }] }
      ]
    }
    patcher.patchConfig(config)
    assert.deepEqual(config.contractConfigs?.[0]?.moveResourceChangeConfigs?.[0]?.types, ['new'])
  })
})
