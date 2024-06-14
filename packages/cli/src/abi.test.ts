import { describe, test } from 'node:test'
import { getABI } from './abi.js'
import { EthChainId, SuiChainId } from '@sentio/chain'
import { expect } from 'chai'

describe('Test ABI get', () => {
  if (process.env.CI) {
    test.todo(`don't run test in ci`)
    return
  }

  test('cronos', async () => {
    const abi = await getABI(EthChainId.CRONOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('optimism', async () => {
    const abi = await getABI(EthChainId.OPTIMISM, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('bsc', async () => {
    const abi = await getABI(EthChainId.BINANCE, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('goerli', async () => {
    const abi = await getABI(EthChainId.GOERLI, '0xd864C4a1B739B7e0bb9e2ae495583Eb5Da0d37F5', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('polygon', async () => {
    const abi = await getABI(EthChainId.POLYGON, '0x7FFB3d637014488b63fb9858E279385685AFc1e2', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('fantom', async () => {
    const abi = await getABI(EthChainId.FANTOM, '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('sui_test', async () => {
    const abi = await getABI(
      SuiChainId.SUI_TESTNET,
      '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2',
      undefined
    )
    expect(abi.abi !== undefined).eq(true)
  })
})
