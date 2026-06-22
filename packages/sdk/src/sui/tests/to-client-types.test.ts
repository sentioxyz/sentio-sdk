import { describe, test } from 'node:test'
import { expect } from 'chai'
import { defaultMoveCoder } from '../move-coder.js'
import { loadAllTypes } from '../builtin/0x2.js'
import { SuiNetwork } from '../network.js'
import { parseMoveType } from '../../move/index.js'
import { toSuiClientObject } from '../to-client-types.js'

// Raw protojson of a `sui.rpc.v2.Object` exactly as the Sentio driver emits it
// (BatchGetObjects -> protojson.Marshal): note `objectType` / `owner.kind` /
// `contents`, not the unified `type` / `owner.$kind`.
const grpcObject = {
  objectId: '0xc061d544681939544136efac81d212de377e2ff13eb07ef9079404ebd57cad5d',
  version: '309855314',
  digest: '97mrov7YttYFH7j2gz7TkYu9quXZC4zs4cXkifNGcWrn',
  owner: { kind: 'OBJECT', address: '0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a' },
  objectType:
    '0x0000000000000000000000000000000000000000000000000000000000000002::dynamic_field::Field<0x0000000000000000000000000000000000000000000000000000000000000002::dynamic_object_field::Wrapper<address>,0x0000000000000000000000000000000000000000000000000000000000000002::object::ID>',
  hasPublicTransfer: false,
  contents: { name: 'Object', value: 'd0dV' },
  json: {
    id: '0xc061d544681939544136efac81d212de377e2ff13eb07ef9079404ebd57cad5d',
    name: { name: '0xe859a7ebc84e7573d1e81ef99946f8821aeb0ff67454e579a32dd216da239621' },
    value: '0xc0254d60d00d9215c3a878ad2ea020aeebfb336eb143e5919a8209e71db998a0'
  }
}

describe('toSuiClientObject', () => {
  test('maps gRPC protojson Object to unified SuiClientTypes shape', () => {
    const o = toSuiClientObject(grpcObject) as any
    expect(o.type).equals(grpcObject.objectType) // objectType -> type
    expect(o.objectId).equals(grpcObject.objectId)
    expect(o.version).equals(grpcObject.version)
    expect(o.owner.$kind).equals('ObjectOwner') // {kind:'OBJECT'} -> ObjectOwner
    expect(o.owner.ObjectOwner).equals(grpcObject.owner.address)
    expect(o.json).deep.equals(grpcObject.json)
  })

  test('owner kinds map to the unified union', () => {
    expect((toSuiClientObject({ owner: { kind: 'ADDRESS', address: '0x1' } }) as any).owner).deep.equals({
      $kind: 'AddressOwner',
      AddressOwner: '0x1'
    })
    expect((toSuiClientObject({ owner: { kind: 'IMMUTABLE' } }) as any).owner).deep.equals({
      $kind: 'Immutable',
      Immutable: true
    })
    expect((toSuiClientObject({ owner: { kind: 'SHARED', version: '7' } }) as any).owner).deep.equals({
      $kind: 'Shared',
      Shared: { initialSharedVersion: '7' }
    })
  })

  test('converted object decodes; the raw gRPC shape does not', async () => {
    const coder = defaultMoveCoder(SuiNetwork.TEST_NET)
    loadAllTypes(coder)
    const matcher = parseMoveType(grpcObject.objectType)

    // The raw shape has no `.type`, so getType() yields '' and nothing matches.
    const rawDecoded = await coder.filterAndDecodeObjects(matcher, [grpcObject as any])
    expect(rawDecoded.length).equals(0)

    // After normalization it matches and decodes the Move struct content.
    const decoded = await coder.filterAndDecodeObjects(matcher, [toSuiClientObject(grpcObject)])
    expect(decoded.length).equals(1)
    const d = decoded[0].data_decoded as any
    expect(d.id.id).equals(grpcObject.json.id)
    expect(d.name.name).equals(grpcObject.json.name.name) // Wrapper<address>{ name }
    expect(d.value).equals(grpcObject.json.value) // ID -> string
  })
})
