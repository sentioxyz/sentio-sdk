import { before, describe, test } from 'node:test'

import { TestProcessorServer } from '../../testing/index.js'
import { mockTransferLog } from '../../eth/builtin/erc20.js'
import { Transaction } from './generated/schema.js'
import { expect } from 'chai'

describe('test entity store for processor', () => {
  const ADDRESS = '0x1000000000000000000000000000000000000000'
  const service = new TestProcessorServer(() => import('./store-processor.js'))

  before(async () => {
    await service.start()
  })

  test('Check entity is stored', async () => {
    await service.eth.testAccountLogs(ADDRESS, [
      mockTransferLog('0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9', {
        from: ADDRESS,
        to: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1',
        value: BigInt(100)
      })
    ])

    const tx = await service.store.get(
      Transaction,
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    )
    expect(tx!.value).to.be.eq(100)
  })
})
