import { before, describe, test } from 'node:test'
import { assert, expect } from 'chai'

import { TestProcessorServer } from '../../testing/index.js'
import { ERC20Processor, mockApprovalLog, mockTransferLog, TransferEvent } from '../builtin/erc20.js'
import { LogLevel } from '@sentio/protos'
import { GLOBAL_CONFIG } from '@sentio/runtime'

describe('Test Error Capture', () => {
  const service = new TestProcessorServer(async () => {
    ERC20Processor.bind({ address: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91' })
      .onEventApproval((evt, ctx) => {
        ctx.eventLogger.emit('Approve', {
          severity: LogLevel.INFO,
          message: `approve ${evt.args}`,
          owner: evt.args.owner,
          spender: evt.args.spender,
          value: evt.args.value
        })
      })
      .onEventTransfer((evt: TransferEvent, ctx) => {
        ctx.eventLogger.emit('Transfer', {
          message: `transferred ${evt.args.value}`,
          severity: LogLevel.WARNING,
          owner: evt.args.from,
          to: evt.args.to,
          from: evt.args.from,
          value: evt.args.value
        })
      })
  })

  before(async () => {
    await service.start()
  })

  test('Check approve', async () => {
    const res = await service.eth.testLog(
      mockApprovalLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
        owner: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
        spender: '0x0000000000000000000000000000000000000000',
        value: 0n
      })
    )
    assert(res.result?.events?.[0].message.includes('approve '))
  })

  test('Check transfer', async () => {
    const res = await service.eth.testLog(
      mockTransferLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
        from: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n
      })
    )
    const events = res.result?.events?.[0]
    expect(events?.message).eq('transferred 0')
    expect(events?.attributes?.from.toLowerCase()).eq('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91')
  })
})

describe('Test ParseLog workers', () => {
  const service = new TestProcessorServer(async () => {
    GLOBAL_CONFIG.execution = {
      ethAbiDecoderConfig: {
        enabled: true
      }
    }
    ERC20Processor.bind({ address: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91' }).onEventTransfer(
      (evt: TransferEvent, ctx) => {
        ctx.eventLogger.emit('Transfer', {
          message: `transferred ${evt.args.value}`,
          severity: LogLevel.WARNING,
          owner: evt.args.from,
          to: evt.args.to,
          from: evt.args.from,
          value: evt.args.value
        })
      }
    )
  })

  before(async () => {
    await service.start()
  })

  test('Check transfer', async () => {
    const res = await service.eth.testLog(
      mockTransferLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
        from: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n
      })
    )
    const events = res.result?.events?.[0]
    expect(events?.message).eq('transferred 0')
    expect(events?.attributes?.from.toLowerCase()).eq('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91')
  })
})
