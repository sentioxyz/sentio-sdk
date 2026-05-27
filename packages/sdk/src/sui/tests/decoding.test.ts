import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { defaultMoveCoder } from '../move-coder.js'

import { coin, dynamic_field, loadAllTypes } from '../builtin/0x2.js'
import { expect } from 'chai'
import { TypedSuiMoveObject } from '../models.js'
import { SuiNetwork } from '../network.js'
import { BUILTIN_TYPES, parseMoveType } from '../../move/index.js'
import { single_collateral } from './types/testnet/0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2.js'
import { ascii } from '../builtin/0x1.js'

// gRPC SuiMoveObjectInput fixtures ({ type, objectId, version, json }), derived
// from the original on-chain dynamic-field objects (now pruned from fullnodes).
const loadFixture = (name: string) => JSON.parse(readFileSync(new URL(`./data/${name}.json`, import.meta.url), 'utf8'))
const df1 = loadFixture('decoding-df1')
const df2 = loadFixture('decoding-df2')
const df3 = loadFixture('decoding-df3')

describe('Test Sui Example', () => {
  const coder = defaultMoveCoder(SuiNetwork.TEST_NET)
  loadAllTypes(coder)

  test('decode string', async () => {
    const res = await coder.decodeType('mystring', ascii.String.type())
    expect(res).equals('mystring')
  })

  test('decode object', async () => {
    // gRPC Object.json shape (flat decoded Move struct content).
    const data = {
      create_ts_ms: '1680756795894',
      creator: '0xb6c7e3b1c61ee81516a8317f221daa035f1503e0ac3ae7a50b61834bc7a3ead9',
      delivery_info: {
        premium: '0',
        price: '603716059',
        round: '11',
        size: '0',
        ts_ms: '1681635628133'
      },
      index: '11',
      round: '11'
    }
    const res = await coder.decodeType(
      data,
      parseMoveType('0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::Info')
    )
    expect(res.delivery_info.price).equals(603716059n)
    // console.log(res)
  })

  test('decode object2', async () => {
    // gRPC Object.json shape (flat decoded Move struct content).
    const subVault = {
      balance: '0',
      index: '11',
      share_supply: '0',
      tag: '4',
      user_shares: {
        first: null,
        id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
        last: null,
        length: '0'
      }
    }
    const data = {
      bidder_sub_vault: { ...subVault, tag: '4' },
      performance_fee_sub_vault: { ...subVault, tag: '6' },
      premium_sub_vault: { ...subVault, tag: '5' }
    }
    const res = await coder.decodeType(
      data,
      parseMoveType(
        '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::BidVault<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::ManagerCap, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>'
      )
    )
    expect(res.performance_fee_sub_vault.balance).equals(0n)
    // console.log(res)
  })

  test('decode dynamic fields', async () => {
    const objects = df1 as any
    const res = (await coder.filterAndDecodeObjects(
      parseMoveType('0x2::dynamic_field::Field<address, bool>'),
      objects
    )) as any
    expect(res.length).eq(objects.length)
    const fieldType = dynamic_field.Field.type(BUILTIN_TYPES.ADDRESS_TYPE, BUILTIN_TYPES.BOOL_TYPE)
    const res2 = (await coder.filterAndDecodeObjects(fieldType, objects)).map((e) => e.data_decoded)
    expect(res2.length).eq(objects.length)

    const decodedObjects = await coder.getDynamicFields(objects, BUILTIN_TYPES.ADDRESS_TYPE, BUILTIN_TYPES.BOOL_TYPE)
    expect(res.length).eq(decodedObjects.length)
    // console.log(decodedObjects)
  })

  test('decode dynamic fields 2', async () => {
    const objects = df2 as any
    const res: TypedSuiMoveObject<dynamic_field.Field<any, any>>[] = await coder.filterAndDecodeObjects(
      dynamic_field.Field.type(),
      objects
    )
    expect(res.length).eq(objects.length)

    const decodedObjects = await coder.getDynamicFields(
      objects as any,
      BUILTIN_TYPES.U64_TYPE,
      single_collateral.PortfolioVault.type()
    )
    expect(res.length).eq(1)
    // console.log(decodedObjects)
  })

  test('decode dynamic fields 3', async () => {
    const objects = df3 as any
    const coder = defaultMoveCoder(SuiNetwork.MAIN_NET)

    const res: TypedSuiMoveObject<dynamic_field.Field<any, any>>[] = await coder.filterAndDecodeObjects(
      dynamic_field.Field.type(),
      objects
    )
    expect(res.length).eq(objects.length)

    // const decodedObjects = await coder.getDynamicFields(
    //     objects,
    //     BUILTIN_TYPES.U8_TYPE,
    //     single_collateral.PortfolioVault.type()
    // )
    // expect(res.length).eq(5)
    console.log(objects)
  })

  test('decode array', async () => {
    const res = await coder.decodeArray(
      [
        '0x7778e8c334013aacc9308eeea1f3cb377cc483a46a0dd2d09293996724c64d4a',
        '0xf9a081de27ab4ef435c619e032082e279830726453cbec62cfb84477b350aaf6',
        undefined
      ],
      [
        parseMoveType('&0xf0bae856227dd70c836a9efa09d18807b56e16434a7bd3e0bd1c85ecbd9ed1af::pause::Pause'),
        parseMoveType('&0xf0bae856227dd70c836a9efa09d18807b56e16434a7bd3e0bd1c85ecbd9ed1af::maven::Maven'),
        coin.Coin.type()
      ]
    )
    expect(res.length).equals(3)
  })

  test('check account norm', async () => {
    const f1 = await coder.getMoveStruct('0x2::bcs::BCS')
    const f2 = await coder.getMoveStruct('0x002::bcs::BCS')
    const f3 = await coder.getMoveStruct('0x1::option::Option')

    expect(f1).equals(f2)
    expect(f1).not.equals(f3)
  })
})
