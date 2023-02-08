import { assert, expect } from 'chai'

import { TestProcessorServer } from '@sentio/sdk/testing'
import { ERC20Processor, mockApprovalLog, mockTransferLog, TransferEvent } from '../eth/builtin/erc20/index.js'
import { LogLevel } from '@sentio/protos'

describe('Test Error Capture', () => {
  const service = new TestProcessorServer(async () => {
    ERC20Processor.bind({ address: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91' })
      .onEventApproval((evt, ctx) => {
        ctx.eventLogger.emit('Approve', {
          severity: LogLevel.INFO,
          message: `approve ${evt.args}`,
          owner: evt.args.owner,
          spender: evt.args.spender,
          value: evt.args.value,
        })
      })
      .onEventTransfer((evt: TransferEvent, ctx) => {
        ctx.eventLogger.emit('Transfer', {
          severity: LogLevel.WARNING,
          owner: evt.args.from,
          to: evt.args.to,
          value: evt.args.value,
        })
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
        value: 0n,
      })
    )
    assert(res.result?.logs?.[0].message.includes('approve '))
  })

  test('Check transfer', async () => {
    const res = await service.testLog(
      mockTransferLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
        from: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n,
      })
    )
    const log = res.result?.logs?.[0]
    expect(log?.message).eq('transferred 0')
    expect(log?.attributes2?.from.toLowerCase()).eq('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91')
  })
})
