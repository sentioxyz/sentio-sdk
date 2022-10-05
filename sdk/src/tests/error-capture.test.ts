import { assert } from 'chai'

import { TestProcessorServer } from '../testing'
import { BigNumber } from 'ethers'
import { mockApprovalLog, mockOwnershipTransferredLog, mockTransferLog } from '../builtin/erc20/test-utils'
import { ERC20Processor } from '../builtin/internal/erc20_processor'
import { conversion } from '../utils'
import { BigDecimal } from '@sentio/sdk'

describe('Test Error Capture', () => {
  const service = new TestProcessorServer(() => {
    ERC20Processor.bind({ address: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91' })
      .onEventApproval((evt, ctx) => {
        const v = new BigDecimal(1).div(conversion.toBigDecimal(evt.args.value))
        ctx.meter.Gauge('xx').record(v)
      })
      .onEventTransfer((evt, ctx) => {
        const v = new BigDecimal(0).div(conversion.toBigDecimal(evt.args.value))
        ctx.meter.Gauge('xx').record(v)
      })
      .onEventOwnershipTransferred((evt, ctx) => {
        ctx.meter.Gauge('xx').record(BigNumber.from(10 ** 18))
      })
  })

  beforeAll(async () => {
    await service.start()
  })

  test('Check infinite', async () => {
    let err: Error | undefined
    try {
      // TODO check why order matters
      //     await service.testLog(mockApprovalLog("0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91", {
      //       value: BigNumber.from(3000000),
      //       spender: "0x0000000000000000000000000000000000000000",
      //       owner: "0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91"
      //     }))
      await service.testLog(
        mockApprovalLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
          owner: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
          spender: '0x0000000000000000000000000000000000000000',
          value: BigNumber.from(0),
        })
      )
    } catch (e) {
      err = e
    }
    assert(err?.message.includes('Record infinite value'))
  })

  test('Check NaN', async () => {
    let err: Error | undefined
    try {
      await service.testLog(
        mockTransferLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
          from: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
          to: '0x0000000000000000000000000000000000000000',
          value: BigNumber.from(0),
        })
      )
    } catch (e) {
      err = e
    }
    assert(err?.message.includes('NaN'))
  })

  test('Check overflow', async () => {
    let err: Error | undefined
    try {
      await service.testLog(
        mockOwnershipTransferredLog('0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91', {
          previousOwner: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
          newOwner: '0x0000000000000000000000000000000000000000',
        })
      )
    } catch (e) {
      err = e
    }
    assert(err?.message.includes('overflow'))
  })
})
