import { before, describe, test } from 'node:test'
import { expect } from 'chai'

import { HandlerType } from '../../index.js'
import { TestProcessorServer, firstCounterValue } from '../../testing/index.js'

const SPL_TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
const PYUSD_MINT = '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo'
const OTHER_MINT = 'So11111111111111111111111111111111111111112'

describe('Test SPL Token 2022 Example', () => {
  const service = new TestProcessorServer(async () => {
    await import('./pyusd-token-2022.js')
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
  })

  test('mintTo for PYUSD increments supply', async () => {
    const instructions = [
      {
        instructionData: '',
        slot: 100n,
        programAccountId: SPL_TOKEN_2022_PROGRAM_ID,
        parsed: {
          type: 'mintTo',
          info: {
            account: '2SDN4vEJdCdW3pGyhx2km9gB3LeHzMGLrG2j4uVNZfrx',
            amount: '1500000000',
            mint: PYUSD_MINT,
            mintAuthority: 'BCD75RNBHrJJpW4dXVagL5mPjzRLnVZq4YirJdjEYMV7'
          }
        },
        accounts: []
      }
    ]
    const res = await service.solana.testInstructions(instructions)
    expect(res.result?.counters).length(1)
    expect(firstCounterValue(res.result, 'pyusd_supply')?.toString()).equal('1500000000')
    expect(res.result?.counters[0].runtimeInfo?.from).equals(HandlerType.SOL_INSTRUCTION)
  })

  test('transferChecked for PYUSD increments volume and count', async () => {
    const instructions = [
      {
        instructionData: '',
        slot: 101n,
        programAccountId: SPL_TOKEN_2022_PROGRAM_ID,
        parsed: {
          type: 'transferChecked',
          info: {
            source: '11111111111111111111111111111111',
            destination: '22222222222222222222222222222222',
            mint: PYUSD_MINT,
            authority: '33333333333333333333333333333333',
            tokenAmount: {
              amount: '2000000',
              decimals: 6,
              uiAmountString: '2.0'
            }
          }
        },
        accounts: []
      }
    ]
    const res = await service.solana.testInstructions(instructions)
    expect(res.result?.counters).length(2)
    expect(firstCounterValue(res.result, 'pyusd_transfer_volume')?.toString()).equal('2000000')
    expect(firstCounterValue(res.result, 'pyusd_transfer_count')?.toString()).equal('1')
  })

  test('mint filter skips non-PYUSD mints', async () => {
    const instructions = [
      {
        instructionData: '',
        slot: 102n,
        programAccountId: SPL_TOKEN_2022_PROGRAM_ID,
        parsed: {
          type: 'mintTo',
          info: {
            account: '2SDN4vEJdCdW3pGyhx2km9gB3LeHzMGLrG2j4uVNZfrx',
            amount: '9999',
            mint: OTHER_MINT,
            mintAuthority: 'BCD75RNBHrJJpW4dXVagL5mPjzRLnVZq4YirJdjEYMV7'
          }
        },
        accounts: []
      }
    ]
    const res = await service.solana.testInstructions(instructions)
    expect(res.result?.counters).length(0)
    expect(res.result?.gauges).length(0)
  })
})
