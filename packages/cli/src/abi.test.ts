import { getABI } from './abi.js'
import { CHAIN_IDS } from './chain.js'
import { expect } from 'chai'

describe('Test ABI get', () => {
  if (process.env.CI) {
    return
  }

  test('moonbean', async () => {
    const abi = await getABI(CHAIN_IDS.MOONBEAM, '0xacc15dc74880c9944775448304b263d191c6077f', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('cronos', async () => {
    const abi = await getABI(CHAIN_IDS.CRONOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('optimism', async () => {
    const abi = await getABI(CHAIN_IDS.OPTIMISM, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('bsc', async () => {
    const abi = await getABI(CHAIN_IDS.BINANCE, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('goerli', async () => {
    const abi = await getABI(CHAIN_IDS.GOERLI, '0xd864C4a1B739B7e0bb9e2ae495583Eb5Da0d37F5', undefined)
    expect(abi.abi !== undefined).eq(true)
  })

  test('polygon', async () => {
    const abi = await getABI(CHAIN_IDS.POLYGON, '0x7FFB3d637014488b63fb9858E279385685AFc1e2', undefined)
    expect(abi.abi !== undefined).eq(true)
  })
})
