import type { SuiClientTypes } from '@mysten/sui/client'
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

// Mirrors mapOwner in @mysten/sui's grpc core. protojson serializes the
// Owner.OwnerKind enum to its proto value name and uint64 `version` to a string.
// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L821
function mapOwner(owner: any): SuiClientTypes.ObjectOwner | null {
  if (!owner) {
    return null
  }
  switch (owner.kind) {
    case 'IMMUTABLE':
      return { $kind: 'Immutable', Immutable: true }
    case 'ADDRESS':
      return { $kind: 'AddressOwner', AddressOwner: owner.address }
    case 'OBJECT':
      return { $kind: 'ObjectOwner', ObjectOwner: owner.address }
    case 'SHARED':
      return { $kind: 'Shared', Shared: { initialSharedVersion: String(owner.version) } }
    case 'CONSENSUS_ADDRESS':
      return {
        $kind: 'ConsensusAddressOwner',
        ConsensusAddressOwner: { startVersion: String(owner.version), owner: owner.address }
      }
    default:
      return { $kind: 'Unknown' }
  }
}

// protojson `sui.rpc.v2.Object` -> unified `SuiClientTypes.Object<{ json: true }>`.
// Already-unified inputs (from `SuiGrpcClient.core`) pass through: `.type` and
// `.json` are read with the gRPC names falling back to the unified ones. With
// `Include = { json: true }` every field except objectId/version/digest/owner/
// type/json is typed `undefined`, so we deliberately leave them unset.
// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L176
export function toSuiClientObject(o: any): SuiMoveObjectInput {
  return {
    objectId: o.objectId,
    version: o.version,
    digest: o.digest,
    owner: mapOwner(o.owner)!,
    type: o.objectType ?? o.type ?? '',
    content: undefined,
    previousTransaction: undefined,
    objectBcs: undefined,
    json: o.json ?? null,
    display: undefined
  } as SuiMoveObjectInput
}

// Enum mapping mirrors @mysten/sui's grpc core (parseTransactionEffects), but
// reads protojson enum *value names* (the Sentio driver delivers protojson, so
// enums arrive as their proto names, not protobuf-es numeric values). Absent
// fields map to 'Unknown' to honor the non-nullable `SuiClientTypes.ChangedObject`
// state types.
// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L1065
function mapInputObjectState(state: any): SuiClientTypes.ChangedObject['inputState'] {
  switch (state) {
    case 'INPUT_OBJECT_STATE_EXISTS':
      return 'Exists'
    case 'INPUT_OBJECT_STATE_DOES_NOT_EXIST':
      return 'DoesNotExist'
    default:
      return 'Unknown'
  }
}

// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L1084
function mapOutputObjectState(state: any): SuiClientTypes.ChangedObject['outputState'] {
  switch (state) {
    case 'OUTPUT_OBJECT_STATE_OBJECT_WRITE':
      return 'ObjectWrite'
    case 'OUTPUT_OBJECT_STATE_PACKAGE_WRITE':
      return 'PackageWrite'
    case 'OUTPUT_OBJECT_STATE_DOES_NOT_EXIST':
      return 'DoesNotExist'
    case 'OUTPUT_OBJECT_STATE_ACCUMULATOR_WRITE':
      return 'AccumulatorWriteV1'
    default:
      return 'Unknown'
  }
}

// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L1045
function mapIdOperation(operation: any): SuiClientTypes.ChangedObject['idOperation'] {
  switch (operation) {
    case 'CREATED':
      return 'Created'
    case 'DELETED':
      return 'Deleted'
    case 'NONE':
    case 'ID_OPERATION_UNKNOWN':
      return 'None'
    default:
      return 'Unknown'
  }
}

// protojson `sui.rpc.v2.ChangedObject` -> unified `SuiClientTypes.ChangedObject`.
// Mirrors the per-change mapping in @mysten/sui's grpc core so handlers see the
// same shape `SuiGrpcClient.core` would produce. `objectType`/`accumulatorWrite`
// exist on the gRPC message but not the unified type, so they are dropped.
// Source: https://github.com/MystenLabs/ts-sdks/blob/8588da38e0a813f87b345c348e63486a7a766a61/packages/sui/src/grpc/core.ts#L1141
export function toSuiClientChangedObject(c: any): SuiClientTypes.ChangedObject {
  return {
    objectId: c.objectId,
    inputState: mapInputObjectState(c.inputState),
    inputVersion: c.inputVersion ?? null,
    inputDigest: c.inputDigest ?? null,
    inputOwner: mapOwner(c.inputOwner),
    outputState: mapOutputObjectState(c.outputState),
    outputVersion: c.outputVersion ?? null,
    outputDigest: c.outputDigest ?? null,
    outputOwner: mapOwner(c.outputOwner),
    idOperation: mapIdOperation(c.idOperation)
  }
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
