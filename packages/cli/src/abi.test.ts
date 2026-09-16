import { describe, test } from 'node:test'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import {
  getABI,
  collectLegacySuiAbis,
  convertLegacySuiAbis,
  isLegacyNormalizedModules,
  normalizedModulesToAbi
} from './abi.js'
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

describe('Test legacy Sui ABI conversion', () => {
  // The `{ name: module }` map returned by JSON-RPC getNormalizedMoveModulesByPackage.
  const legacyModule = {
    fileFormatVersion: 6,
    address: '0xpkg',
    name: 'm1',
    friends: [],
    structs: {
      S: {
        abilities: { abilities: ['Copy', 'Drop'] },
        typeParameters: [{ constraints: { abilities: ['Store'] }, isPhantom: false }],
        fields: [
          { name: 'x', type: 'U64' },
          { name: 'v', type: { Vector: { TypeParameter: 0 } } },
          { name: 'id', type: { Struct: { address: '0x2', module: 'object', name: 'UID', typeArguments: [] } } }
        ]
      }
    },
    exposedFunctions: {
      f: {
        visibility: 'Public',
        isEntry: true,
        typeParameters: [{ abilities: ['Drop'] }],
        parameters: [
          'U64',
          { MutableReference: { Struct: { address: '0x2', module: 'tx_context', name: 'TxContext' } } }
        ],
        return: [{ Reference: 'Bool' }]
      }
    }
  }
  const legacyModuleMap = { m1: legacyModule }
  // The pre-gRPC codegen read modules through Object.values, so an array of
  // modules (e.g. saved by hand from a JSON-RPC response) was accepted too.
  const legacyModuleArray = [legacyModule]
  const grpcShapeAbi = [{ address: '0x111', module: { name: 'n', datatypes: [], functions: [] } }]
  const convertedModule = {
    address: '0xpkg',
    module: {
      name: 'm1',
      datatypes: [
        {
          name: 'S',
          kind: 1,
          abilities: [1, 2],
          typeParameters: [{ constraints: [3] }],
          fields: [
            { name: 'x', position: 0, type: { type: 6, typeParameterInstantiation: [] } },
            {
              name: 'v',
              position: 1,
              type: {
                type: 9,
                typeParameterInstantiation: [{ type: 11, typeParameter: 0, typeParameterInstantiation: [] }]
              }
            },
            {
              name: 'id',
              position: 2,
              type: { type: 10, typeName: '0x2::object::UID', typeParameterInstantiation: [] }
            }
          ],
          variants: []
        }
      ],
      functions: [
        {
          name: 'f',
          visibility: 2,
          isEntry: true,
          typeParameters: [{ constraints: [2] }],
          parameters: [
            { body: { type: 6, typeParameterInstantiation: [] } },
            { reference: 2, body: { type: 10, typeName: '0x2::tx_context::TxContext', typeParameterInstantiation: [] } }
          ],
          returns: [{ reference: 1, body: { type: 2, typeParameterInstantiation: [] } }]
        }
      ]
    }
  }

  function makeDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentio-sui-abi-'))
    fs.mkdirSync(path.join(dir, 'testnet'), { recursive: true })
    return dir
  }

  function write(file: string, content: any) {
    fs.writeFileSync(file, JSON.stringify(content))
  }

  function read(file: string) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }

  describe('isLegacyNormalizedModules', () => {
    test('detects the JSON-RPC module map, also wrapped in result', () => {
      expect(isLegacyNormalizedModules(legacyModuleMap)).eq(true)
      expect(isLegacyNormalizedModules({ result: legacyModuleMap })).eq(true)
    })

    test('detects an array of legacy modules', () => {
      expect(isLegacyNormalizedModules(legacyModuleArray)).eq(true)
      expect(isLegacyNormalizedModules({ result: legacyModuleArray })).eq(true)
    })

    test('does not flag the gRPC array shape or non-ABI content', () => {
      expect(isLegacyNormalizedModules(grpcShapeAbi)).eq(false)
      expect(isLegacyNormalizedModules([])).eq(false)
      expect(isLegacyNormalizedModules({})).eq(false)
      expect(isLegacyNormalizedModules(null)).eq(false)
      expect(isLegacyNormalizedModules('abi')).eq(false)
    })
  })

  describe('normalizedModulesToAbi', () => {
    test('converts the module map to the gRPC array shape', () => {
      expect(normalizedModulesToAbi(legacyModuleMap)).deep.eq([convertedModule])
      expect(normalizedModulesToAbi({ result: legacyModuleMap })).deep.eq([convertedModule])
    })

    test('converts an array of legacy modules identically', () => {
      expect(normalizedModulesToAbi(legacyModuleArray)).deep.eq([convertedModule])
    })

    test('uses the fallback address only for modules without one', () => {
      const { address, ...noAddress } = legacyModule
      expect(normalizedModulesToAbi([noAddress], '0xfile')[0].address).eq('0xfile')
      expect(normalizedModulesToAbi([legacyModule], '0xfile')[0].address).eq(address)
      expect(() => normalizedModulesToAbi([noAddress])).throw('cannot resolve package address of module m1')
    })
  })

  describe('collectLegacySuiAbis', () => {
    test('collects legacy map and array files, recursing into testnet/', () => {
      const dir = makeDir()
      try {
        const mapFile = path.join(dir, '0xabc.json')
        const arrayFile = path.join(dir, 'testnet', 'my-package.json')
        write(mapFile, legacyModuleMap)
        write(arrayFile, legacyModuleArray)
        write(path.join(dir, '0x111.json'), grpcShapeAbi)
        fs.writeFileSync(path.join(dir, 'broken.json'), '{')
        fs.writeFileSync(path.join(dir, 'notes.txt'), JSON.stringify(legacyModuleMap))

        const legacy = collectLegacySuiAbis(dir).sort((a, b) => a.file.localeCompare(b.file))

        expect(legacy.map((l) => l.file)).deep.eq([mapFile, arrayFile])
        expect(legacy[0].fallbackAddress).eq('0xabc')
        expect(legacy[0].modules).deep.eq(legacyModuleMap)
        expect(legacy[1].fallbackAddress).eq(undefined)
        expect(legacy[1].modules).deep.eq(legacyModuleArray)
      } finally {
        fs.removeSync(dir)
      }
    })

    test('returns nothing for a missing directory', () => {
      expect(collectLegacySuiAbis(path.join(os.tmpdir(), 'sentio-sui-abi-missing'))).length(0)
    })
  })

  describe('convertLegacySuiAbis', () => {
    test('rewrites legacy files in place and leaves gRPC-shape files untouched', () => {
      const dir = makeDir()
      try {
        const mapFile = path.join(dir, '0xabc.json')
        const arrayFile = path.join(dir, 'testnet', 'my-package.json')
        const grpcFile = path.join(dir, '0x111.json')
        write(mapFile, legacyModuleMap)
        write(arrayFile, legacyModuleArray)
        write(grpcFile, grpcShapeAbi)
        const grpcRaw = fs.readFileSync(grpcFile, 'utf8')

        convertLegacySuiAbis(dir)

        expect(read(mapFile)).deep.eq([convertedModule])
        expect(read(arrayFile)).deep.eq([convertedModule])
        expect(fs.readFileSync(grpcFile, 'utf8')).eq(grpcRaw)
        // Converted files are in the gRPC shape now, so a second pass is a no-op.
        expect(collectLegacySuiAbis(dir)).length(0)
      } finally {
        fs.removeSync(dir)
      }
    })

    test('takes the package address from the file name when the modules carry none', () => {
      const dir = makeDir()
      try {
        const { address, ...noAddress } = legacyModule
        const file = path.join(dir, '0xfromfile.json')
        write(file, { m1: noAddress })

        convertLegacySuiAbis(dir)

        expect(read(file)).deep.eq([{ ...convertedModule, address: '0xfromfile' }])
      } finally {
        fs.removeSync(dir)
      }
    })

    test('skips a file whose package address cannot be resolved', () => {
      const dir = makeDir()
      try {
        const { address, ...noAddress } = legacyModule
        const file = path.join(dir, 'custom-name.json')
        write(file, { m1: noAddress })
        const raw = fs.readFileSync(file, 'utf8')

        convertLegacySuiAbis(dir)

        expect(fs.readFileSync(file, 'utf8')).eq(raw)
      } finally {
        fs.removeSync(dir)
      }
    })
  })
})
