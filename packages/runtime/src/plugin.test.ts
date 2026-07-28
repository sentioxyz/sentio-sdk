import { describe, test } from 'node:test'
import assert from 'assert'
import { create } from '@bufbuild/protobuf'
import { ContractConfigSchema, DataBindingSchema, HandlerType, ProcessConfigResponseSchema } from '@sentio/protos'
import { PluginManager } from './plugin.js'

// describeBinding is what tells the user which handler a late message came from, so it
// has to name the contract too: with processor templates the same handler is bound once
// per instance, and the handler name alone cannot tell them apart.
describe('PluginManager.describeBinding', () => {
  function managerWithConfig() {
    const manager = new PluginManager()
    const config = create(ProcessConfigResponseSchema, {
      contractConfigs: [
        create(ContractConfigSchema, {
          contract: { chainId: '56', name: 'TermMaxVault', address: '0xe5e01b82904a49ce5a670c1b7488c3f29433088a' },
          intervalConfigs: [{ handlerId: 18, handlerName: 'TermMaxVaultProcessorTemplate.onTimeInterval' }]
        }),
        // Same handler name, different instance — the address is the only difference.
        create(ContractConfigSchema, {
          contract: { chainId: '56', name: 'TermMaxVault', address: '0x89653e6523fb73284353252b41ae580e6f96dfad' },
          intervalConfigs: [{ handlerId: 19, handlerName: 'TermMaxVaultProcessorTemplate.onTimeInterval' }]
        })
      ]
    })
    manager.handlerDescriptors.build(config)
    return manager
  }

  const binding = (handlerIds: number[], rawBlock?: string) =>
    create(DataBindingSchema, {
      handlerIds,
      handlerType: HandlerType.ETH_BLOCK,
      chainId: '56',
      ...(rawBlock ? { data: { value: { case: 'ethBlock' as const, value: { rawBlock } } } } : {})
    })

  test('labels a handler with its contract, type and name', () => {
    const desc = managerWithConfig().describeBinding(binding([18]))
    assert.match(desc, /18#TermMaxVault:0xe5e01b82904a49ce5a670c1b7488c3f29433088a/)
    assert.match(desc, /\/interval\/TermMaxVaultProcessorTemplate\.onTimeInterval/)
  })

  test('distinguishes two template instances sharing a handler name', () => {
    const manager = managerWithConfig()
    const first = manager.describeBinding(binding([18]))
    const second = manager.describeBinding(binding([19]))
    assert.notEqual(first, second, 'the contract address must disambiguate them')
    assert.match(second, /0x89653e6523fb73284353252b41ae580e6f96dfad/)
  })

  test('includes what triggered the run when the binding carries it', () => {
    const desc = managerWithConfig().describeBinding(
      binding([18], JSON.stringify({ number: '0x31a3f04', hash: '0x8d8186123456' }))
    )
    assert.match(desc, /at block 52051716/, 'hex block numbers must be decoded')
    assert.match(desc, /hash 0x8d818612/)
  })

  test('falls back to handler ids when the config has no label', () => {
    assert.match(managerWithConfig().describeBinding(binding([99])), /handlerId 99 \(ETH_BLOCK on chain 56\)/)
  })

  // Dropping the ids it cannot name would hide a candidate handler: the late op may
  // well have come from the one that has no label.
  test('keeps unnamed ids alongside named ones', () => {
    const desc = managerWithConfig().describeBinding(binding([18, 99]))
    assert.match(desc, /TermMaxVaultProcessorTemplate\.onTimeInterval/)
    assert.match(desc, /handlerId 99/, 'the unresolved sibling must survive')
  })

  // Solana instructions are dispatched without per-handler config, so there is no name
  // to resolve; the type and chain must still identify what ran.
  test('identifies bindings that have no resolvable handler name', () => {
    const manager = managerWithConfig()
    const solInstruction = create(DataBindingSchema, {
      handlerIds: [],
      handlerType: HandlerType.SOL_INSTRUCTION,
      chainId: 'sol_mainnet'
    })
    assert.match(manager.describeBinding(solInstruction), /no handler id \(SOL_INSTRUCTION on chain sol_mainnet\)/)
  })

  // Solana block handlers, by contrast, do reach the config via intervalConfigs.
  test('resolves Solana block handlers from intervalConfigs', () => {
    const manager = new PluginManager()
    manager.handlerDescriptors.build(
      create(ProcessConfigResponseSchema, {
        contractConfigs: [
          create(ContractConfigSchema, {
            contract: { chainId: 'sol_mainnet', name: 'MyProgram', address: 'Prog111' },
            intervalConfigs: [{ handlerId: 0, handlerName: 'onSlotInterval' }]
          })
        ]
      })
    )
    const desc = manager.describeBinding(
      create(DataBindingSchema, { handlerIds: [0], handlerType: HandlerType.SOL_BLOCK, chainId: 'sol_mainnet' })
    )
    assert.match(desc, /0#MyProgram:Prog111\/interval\/onSlotInterval/)
  })

  test('a malformed payload does not break the description', () => {
    const desc = managerWithConfig().describeBinding(binding([18], 'not json'))
    assert.match(desc, /TermMaxVaultProcessorTemplate\.onTimeInterval/, 'handler label must survive')
    assert.ok(!desc.includes('at '), 'unparseable trigger data is simply omitted')
  })
})
