import assert from 'assert'
import { before, beforeEach, describe, test } from 'node:test'
import { TestProcessorServer } from '@sentio/sdk/testing'
import { mockTransferLog } from '@sentio/sdk/eth/builtin/erc20'
import { User } from './schema/schema.js'

describe('Test Processor', () => {
  const server = new TestProcessorServer(async () => await import('./processor.js'))

  before(async () => {
    await server.start()
  })

  beforeEach(() => {
    server.db.reset()
  })

  test('has config', async () => {
    const config = await server.getConfig({})
    assert(config.contractConfigs.length > 0)
  })

  test('data is upsert', async () => {
    await server.eth.testLog(
      mockTransferLog('0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9', {
        from: '0x0000000000000000000000000000000000000000',
        to: '0xb329e39ebefd16f40d38f07643652ce17ca5bac1',
        value: 10n ** 18n * 10n
      })
    )

    const from = await server.store.list(User)
    assert(from.length == 2)
  })
})
