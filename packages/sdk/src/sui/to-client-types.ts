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

// protojson `sui.rpc.v2.Event` -> unified `SuiClientTypes.Event`. The
// discriminating fields (`eventType`, `json`) already share names; only the
// BCS payload is renamed (`contents` -> `bcs`).
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
