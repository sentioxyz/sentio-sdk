import type { SuiClientTypes } from '@mysten/sui/client'
import { GrpcCoreClient, GrpcTypes } from '@mysten/sui/grpc'
import type { SuiEventInput, SuiMoveObjectInput } from '@typemove/sui'

// The Sentio driver delivers Sui objects/events as protojson of the gRPC
// `sui.rpc.v2.{Object,Event}` messages — field names like `objectType` and
// `contents`. typemove's decoder, and the SDK's public handler types, speak
// the unified `@mysten/sui/client` `SuiClientTypes` shape (`type`, `bcs`).
// Normalize at the SDK boundary so nothing downstream ever sees the raw gRPC
// shape: `getType`/`getData` resolve cleanly (`.type` / `.json`) and the
// decoded envelope honestly matches its declared `SuiClientTypes.Object` type.
// `SuiGrpcClient.core` performs the equivalent mapping for standalone callers,
// so both delivery paths converge on `SuiClientTypes` before decoding.

function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'))
}

// protojson `sui.rpc.v2.Object[]` -> unified `SuiClientTypes.Object<{ json: true }>[]`.
//
// Same reuse strategy as `toSuiClientChangedObjects`: instead of mirroring the
// object/owner mapping by hand, drive @mysten/sui's own `getObjects` mapping
// (which also normalizes the struct tag and owner) through a fake transport, so
// SDK upgrades stay in lockstep. `getObjects` chunks ids by 50 and calls
// `ledgerService.batchGetObjects` per chunk reading `{ result: { oneofKind } }`
// per request, so the fake returns objects keyed by the requested id.
// `include: { json: true }` leaves content/objectBcs/previousTransaction/display
// unset, matching the old hand-rolled output.
// See https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L176
export async function toSuiClientObjects(rawObjects: any[]): Promise<SuiMoveObjectInput[]> {
  if (rawObjects.length === 0) {
    return []
  }
  const byId = new Map(rawObjects.map((o) => [o.objectId, GrpcTypes.Object.fromJson(o, { ignoreUnknownFields: true })]))
  const core = new GrpcCoreClient({
    client: {
      ledgerService: {
        batchGetObjects: async ({ requests }: any) => ({
          response: {
            objects: requests.map((r: any) => ({ result: { oneofKind: 'object', object: byId.get(r.objectId) } }))
          }
        })
      }
    }
  } as any)
  const res: any = await core.getObjects({ objectIds: rawObjects.map((o) => o.objectId), include: { json: true } })
  return res.objects as SuiMoveObjectInput[]
}

// protojson `sui.rpc.v2.ChangedObject[]` -> unified `SuiClientTypes.ChangedObject[]`.
//
// Rather than mirror @mysten/sui's enum/owner mapping by hand, we reuse its own
// `parseTransactionEffects` so SDK upgrades pick up upstream changes (new enum
// values, owner kinds, bug fixes) automatically instead of silently drifting.
// That function isn't exported, so we reach it through its only public caller,
// `GrpcCoreClient.getTransaction`, fed by an in-memory fake transport that hands
// back our changes as a protobuf-ts `TransactionEffects` message.
//
// Two upstream-internal details this depends on (both asserted by
// to-client-types.test.ts, which fails loudly if an upgrade changes them):
//   1. `parseTransactionEffects` dereferences `effects.status.error` unguarded on
//      the non-success path, so a minimal `status: { success: true }` is required.
//   2. `getTransaction` returns a `{ $kind: 'Transaction', Transaction }` union.
// See https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L1132
export async function toSuiClientChangedObjects(rawChanges: any[]): Promise<SuiClientTypes.ChangedObject[]> {
  if (rawChanges.length === 0) {
    return []
  }
  const effects = GrpcTypes.TransactionEffects.fromJson(
    { status: { success: true }, changedObjects: rawChanges },
    { ignoreUnknownFields: true }
  )
  const core = new GrpcCoreClient({
    client: { ledgerService: { getTransaction: async () => ({ response: { transaction: { digest: '', effects } } }) } }
  } as any)
  const res: any = await core.getTransaction({ digest: '', include: { effects: true } })
  return (res.Transaction ?? res).effects.changedObjects
}

// protojson `sui.rpc.v2.Event` -> unified `SuiClientTypes.Event`. The
// discriminating fields (`eventType`, `json`) already share names; only the
// BCS payload is renamed (`contents` -> `bcs`).
// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L1279
export function toSuiClientEvent(e: any): SuiEventInput {
  return {
    packageId: e.packageId,
    module: e.module,
    sender: e.sender,
    eventType: e.eventType ?? e.type ?? '',
    bcs: e.contents?.value != null ? base64ToBytes(e.contents.value) : (e.bcs ?? new Uint8Array()),
    json: e.json ?? null
  } as SuiEventInput
}
