import { assert, expect } from 'chai'

import { TestProcessorServer } from '../testing'
import { BigNumber } from 'ethers'
import { mockApprovalLog, mockTransferLog } from '../builtin/erc20/test-utils'
import { ERC20Processor } from '../builtin/internal/erc20_processor'

describe('Test Error Capture', () => {
  const service = new TestProcessorServer(() => {
    ERC20Processor.bind({ address: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91' })
      .onEventApproval((evt, ctx) => {
        ctx.logger.info(`approve ${evt.args}`)
      })
      .onEventTransfer((evt, ctx) => {
        ctx.logger.warn('transferred ' + evt.args.value, { from: evt.args.from })
      })
  })

  beforeAll(async () => {
    await service.start()
  })

  test('Check approve', async () => {
    const res = await service.testLog(
      mockApprovalLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
        owner: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
        spender: '0x0000000000000000000000000000000000000000',
        value: BigNumber.from(0),
      })
    )
    assert(res.result?.logs?.[0].message.includes('approve '))
  })

  test('Check transfer', async () => {
    const res = await service.testLog(
      mockTransferLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
        from: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
        to: '0x0000000000000000000000000000000000000000',
        value: BigNumber.from(0),
      })
    )
    const log = res.result?.logs?.[0]
    expect(log?.message).eq('transferred 0')
    expect(JSON.parse(log?.attributes || '')['from'].toLowerCase()).eq('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91')
  })
})
