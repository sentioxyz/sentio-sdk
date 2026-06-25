import { describe, test } from 'node:test'
import { expect } from 'chai'
import { defaultMoveCoder } from '../move-coder.js'
import { loadAllTypes } from '../builtin/0x2.js'
import { SuiNetwork } from '../network.js'
import { parseMoveType } from '../../move/index.js'
import { toSuiClientChangedObjects, toSuiClientObject } from '../to-client-types.js'

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

// Raw protojson of a `sui.rpc.v2.ChangedObject` as the Sentio driver emits it
// from transaction effects: proto enum *value names* (`OUTPUT_OBJECT_STATE_*`,
// `CREATED`), uint64 versions as strings, and `Owner` in its gRPC `{kind}` shape.
const grpcMutatedChange = {
  objectId: '0xc061d544681939544136efac81d212de377e2ff13eb07ef9079404ebd57cad5d',
  inputState: 'INPUT_OBJECT_STATE_EXISTS',
  inputVersion: '309855313',
  inputDigest: 'AAA',
  inputOwner: { kind: 'ADDRESS', address: '0x1' },
  outputState: 'OUTPUT_OBJECT_STATE_OBJECT_WRITE',
  outputVersion: '309855314',
  outputDigest: 'BBB',
  outputOwner: { kind: 'SHARED', version: '7' },
  idOperation: 'NONE',
  objectType: '0x2::coin::Coin<0x2::sui::SUI>' // present on gRPC, absent on unified
}

// These run the real @mysten/sui `parseTransactionEffects` (via the fake-client
// in `toSuiClientChangedObjects`), so they double as a conformance guard: an
// upgrade that changes the upstream mapping — or the internals the fake-client
// leans on (`status.error` deref, the `{ $kind }` return union) — fails here.
describe('toSuiClientChangedObjects', () => {
  test('maps gRPC protojson ChangedObject to unified SuiClientTypes shape', async () => {
    const [c] = (await toSuiClientChangedObjects([grpcMutatedChange])) as any[]
    expect(c.objectId).equals(grpcMutatedChange.objectId)
    expect(c.inputState).equals('Exists')
    expect(c.outputState).equals('ObjectWrite')
    expect(c.idOperation).equals('None')
    expect(c.inputVersion).equals('309855313') // uint64 string preserved
    expect(c.outputVersion).equals('309855314')
    expect(c.inputDigest).equals('AAA')
    expect(c.outputDigest).equals('BBB')
    expect(c.inputOwner).deep.equals({ $kind: 'AddressOwner', AddressOwner: '0x1' })
    expect(c.outputOwner).deep.equals({ $kind: 'Shared', Shared: { initialSharedVersion: '7' } })
    expect('objectType' in c).equals(false) // dropped: not on the unified type
  })

  test('all enum value names map to the unified literals', async () => {
    const one = async (s: any) => ((await toSuiClientChangedObjects([s])) as any[])[0]
    expect((await one({ inputState: 'INPUT_OBJECT_STATE_DOES_NOT_EXIST' })).inputState).equals('DoesNotExist')
    expect((await one({ outputState: 'OUTPUT_OBJECT_STATE_PACKAGE_WRITE' })).outputState).equals('PackageWrite')
    expect((await one({ outputState: 'OUTPUT_OBJECT_STATE_DOES_NOT_EXIST' })).outputState).equals('DoesNotExist')
    expect((await one({ outputState: 'OUTPUT_OBJECT_STATE_ACCUMULATOR_WRITE' })).outputState).equals(
      'AccumulatorWriteV1'
    )
    expect((await one({ idOperation: 'CREATED' })).idOperation).equals('Created')
    expect((await one({ idOperation: 'DELETED' })).idOperation).equals('Deleted')
    expect((await one({ idOperation: 'ID_OPERATION_UNKNOWN' })).idOperation).equals('None')
  })

  // Upstream maps absent enum/owner fields to null (not 'Unknown'); the empty
  // input short-circuits before constructing the fake client.
  test('absent enum/owner fields become null; empty input yields []', async () => {
    const [c] = (await toSuiClientChangedObjects([{ objectId: '0x9' }])) as any[]
    expect(c.inputState).equals(null)
    expect(c.outputState).equals(null)
    expect(c.idOperation).equals(null)
    expect(c.inputVersion).equals(null)
    expect(c.inputOwner).equals(null)
    expect(c.outputOwner).equals(null)
    expect(await toSuiClientChangedObjects([])).deep.equals([])
  })
})
