import { describe, test } from 'node:test'
import { getABI } from './abi.js'
import { AptosChainId, EthChainId, SuiChainId } from '@sentio/chain'
import { expect } from 'chai'

describe('Test ABI get', () => {
  if (process.env.CI) {
    test.todo(`don't run test in ci`)
    return
  }

  test('ethereum', async () => {
    const abi = await getABI(EthChainId.ETHEREUM, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('cronos', async () => {
    const abi = await getABI(EthChainId.CRONOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('optimism', async () => {
    const abi = await getABI(EthChainId.OPTIMISM, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('bsc', async () => {
    const abi = await getABI(EthChainId.BSC, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('polygon', async () => {
    const abi = await getABI(EthChainId.POLYGON, '0x7FFB3d637014488b63fb9858E279385685AFc1e2', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('sui_test', async () => {
    const abi = await getABI(SuiChainId.SUI_TESTNET, '0xdee9', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('echelon', async () => {
    const abi = await getABI(
      AptosChainId.INITIA_ECHELON,
      '0xedcdbb4c459064293924e0e96e01d5927faa11fd38d331111d99d23f14f6ed7d',
      undefined
    )
    expect(abi.abi !== undefined).eq(true)
  })
})
