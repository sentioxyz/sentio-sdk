import { describe, test } from 'node:test'
import assert from 'assert'
import { HandlerType } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { DataBindingSchema } from '@sentio/protos'
import { Plugin, PluginManager } from './plugin.js'

// describeBinding is what puts the handler name into the late-message error, so it
// must resolve names through the plugin's registry and degrade gracefully when it
// cannot (no registry, unnamed handler, throwing registry).
describe('PluginManager.describeBinding', () => {
  class NamedPlugin extends Plugin {
    name = 'named'
    supportedHandlers = [HandlerType.ETH_LOG]
    handlerRegister = {
      getHandlerName: (chainId: string, id: number) => (id === 7 ? 'MyTemplate.onEventTransfer' : undefined)
    }
  }

  function managerWith(plugin: Plugin) {
    const m = new PluginManager()
    m.plugins = []
    m.typesToPlugin.clear()
    m.register(plugin)
    return m
  }

  const binding = (handlerIds: number[]) =>
    create(DataBindingSchema, { handlerIds, handlerType: HandlerType.ETH_LOG, chainId: '56' })

  test('uses the handler name when the registry knows it', () => {
    const desc = managerWith(new NamedPlugin()).describeBinding(binding([7]))
    assert.match(desc, /MyTemplate\.onEventTransfer/)
    assert.match(desc, /ETH_LOG on chain 56/)
  })

  test('falls back to handler ids when the name is unknown', () => {
    const desc = managerWith(new NamedPlugin()).describeBinding(binding([99]))
    assert.match(desc, /handlerId 99/)
  })

  test('never throws when the registry does', () => {
    class ThrowingPlugin extends NamedPlugin {
      override handlerRegister = {
        getHandlerName: () => {
          throw new Error('boom')
        }
      }
    }
    const desc = managerWith(new ThrowingPlugin()).describeBinding(binding([7]))
    assert.match(desc, /handlerId 7/, 'must degrade, not mask the error being reported')
  })
})
