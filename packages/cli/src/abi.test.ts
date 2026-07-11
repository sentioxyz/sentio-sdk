import { describe, test } from 'node:test'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import { getABI, collectLegacySuiAbis } from './abi.js'
import { AptosChainId, EthChainId, SuiChainId } from '@sentio/chain'
import { expect } from 'chai'

describe('Test ABI get', () => {
  if (process.env.CI) {
    test.todo(`don't run test in ci`)
    return
  }

  test('ethereum', async () => {
    const abi = await getABI(EthChainId.ETHEREUM, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', undefined)
    expect(abi.abi !== undefined && abi.name == 'WETH9').eq(true)
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

describe('Test legacy Sui ABI collection', () => {
  const legacyModuleMap = {
    m1: {
      fileFormatVersion: 6,
      address: '0xpkg',
      name: 'm1',
      friends: [],
      structs: {
        S: { abilities: { abilities: ['Copy', 'Drop'] }, typeParameters: [], fields: [{ name: 'x', type: 'U64' }] }
      },
      exposedFunctions: {
        f: { visibility: 'Public', isEntry: false, typeParameters: [], parameters: ['U64'], return: [] }
      }
    }
  }
  const newShapeAbi = [{ address: '0x111', module: { name: 'n', datatypes: [], functions: [] } }]

  function makeDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentio-sui-abi-'))
    fs.mkdirSync(path.join(dir, 'testnet'), { recursive: true })
    return dir
  }

  test('collects a legacy mainnet ABI with the address taken from its file name', () => {
    const dir = makeDir()
    try {
      const file = path.join(dir, '0xabc.json')
      fs.writeFileSync(file, JSON.stringify(legacyModuleMap))

      const legacy = collectLegacySuiAbis(dir)

      expect(legacy).length(1)
      expect(legacy[0].file).eq(file)
      expect(legacy[0].address).eq('0xabc')
      expect(legacy[0].chain).eq(SuiChainId.SUI_MAINNET)
    } finally {
      fs.removeSync(dir)
    }
  })

  test('marks files under testnet/ as SUI_TESTNET', () => {
    const dir = makeDir()
    try {
      const file = path.join(dir, 'testnet', '0xdef.json')
      fs.writeFileSync(file, JSON.stringify(legacyModuleMap))

      const legacy = collectLegacySuiAbis(dir)

      expect(legacy).length(1)
      expect(legacy[0].chain).eq(SuiChainId.SUI_TESTNET)
    } finally {
      fs.removeSync(dir)
    }
  })

  test('falls back to the module address for files saved under a custom name', () => {
    const dir = makeDir()
    try {
      const file = path.join(dir, 'my-package.json')
      fs.writeFileSync(file, JSON.stringify(legacyModuleMap))

      const legacy = collectLegacySuiAbis(dir)

      expect(legacy).length(1)
      expect(legacy[0].address).eq('0xpkg')
    } finally {
      fs.removeSync(dir)
    }
  })

  test('ignores already-migrated gRPC-shape files', () => {
    const dir = makeDir()
    try {
      fs.writeFileSync(path.join(dir, '0x111.json'), JSON.stringify(newShapeAbi))

      expect(collectLegacySuiAbis(dir)).length(0)
    } finally {
      fs.removeSync(dir)
    }
  })
})
