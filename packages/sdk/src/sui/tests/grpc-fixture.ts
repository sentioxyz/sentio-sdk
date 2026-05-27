import { bcs } from '@mysten/sui/bcs'

// Test helper: convert a legacy JSON-RPC `SuiTransactionBlockResponse` fixture
// into the gRPC `ExecutedTransaction` shape consumed by the migrated SDK.
// Lets us keep real on-chain fixtures while feeding the gRPC-based decoders.

function bcsEncodePure(valueType: any, value: any): number[] | undefined {
  try {
    const t = typeof valueType === 'string' ? valueType : undefined
    let ser
    switch (t) {
      case 'bool':
        ser = bcs.bool().serialize(!!value)
        break
      case 'u8':
        ser = bcs.u8().serialize(Number(value))
        break
      case 'u16':
        ser = bcs.u16().serialize(Number(value))
        break
      case 'u32':
        ser = bcs.u32().serialize(Number(value))
        break
      case 'u64':
        ser = bcs.u64().serialize(BigInt(value))
        break
      case 'u128':
        ser = bcs.u128().serialize(BigInt(value))
        break
      case 'u256':
        ser = bcs.u256().serialize(BigInt(value))
        break
      case 'address':
        ser = bcs.Address.serialize(value)
        break
      default:
        return undefined
    }
    return Array.from(ser.toBytes())
  } catch {
    return undefined
  }
}

function convertInput(input: any): any {
  if (input?.type === 'pure') {
    const pure = bcsEncodePure(input.valueType, input.value)
    return pure ? { kind: 1, pure } : { kind: 1 }
  }
  // object input
  const shared = input?.objectType === 'sharedObject'
  return {
    kind: shared ? 3 : 2,
    objectId: input?.objectId,
    version:
      input?.version != null
        ? BigInt(input.version)
        : input?.initialSharedVersion != null
          ? BigInt(input.initialSharedVersion)
          : undefined,
    digest: input?.digest,
    mutable: input?.mutable ?? false
  }
}

function convertArgument(arg: any): any {
  if (arg === 'GasCoin') return { kind: 1 }
  if (arg && typeof arg === 'object') {
    if ('Input' in arg) return { kind: 2, input: arg.Input }
    if ('Result' in arg) return { kind: 3, result: arg.Result }
    if ('NestedResult' in arg) return { kind: 4, result: arg.NestedResult[0], subresult: arg.NestedResult[1] }
  }
  return { kind: 0 }
}

function convertCommand(tx: any): any {
  if ('MoveCall' in tx) {
    const c = tx.MoveCall
    return {
      command: {
        oneofKind: 'moveCall',
        moveCall: {
          package: c.package,
          module: c.module,
          function: c.function,
          typeArguments: c.type_arguments ?? c.typeArguments ?? [],
          arguments: (c.arguments ?? []).map(convertArgument)
        }
      }
    }
  }
  // Non-MoveCall commands: getMoveCalls only inspects moveCall, so a distinct
  // oneofKind is enough.
  const key = Object.keys(tx)[0]
  return { command: { oneofKind: key ? key[0].toLowerCase() + key.slice(1) : 'unknown' } }
}

// Recursively unwrap legacy JSON-RPC `{ type, fields }` struct wrappers into the
// flat shape carried by gRPC `Object.json` / `Event.json`.
export function flattenSuiFields(value: any): any {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(flattenSuiFields)
  if (value.fields && typeof value.type === 'string') return flattenSuiFields(value.fields)
  const out: any = {}
  for (const [k, v] of Object.entries(value)) out[k] = flattenSuiFields(v)
  return out
}

// Convert a legacy JSON-RPC object `content` (`{ dataType, type, fields }`) into
// the gRPC `SuiMoveObjectInput` shape (`{ type, objectId, version, json }`).
export function toGrpcObject(content: any): any {
  return {
    type: content?.type,
    objectId: content?.objectId ?? content?.fields?.id?.id,
    version: content?.version != null ? String(content.version) : undefined,
    json: flattenSuiFields(content?.fields)
  }
}

export function toGrpcExecutedTransaction(jsonRpc: any): any {
  const ptb = jsonRpc?.transaction?.data?.transaction
  const programmableTransaction =
    ptb?.kind === 'ProgrammableTransaction'
      ? {
          inputs: (ptb.inputs ?? []).map(convertInput),
          commands: (ptb.transactions ?? []).map(convertCommand)
        }
      : undefined

  return {
    digest: jsonRpc?.digest,
    transaction: {
      digest: jsonRpc?.digest,
      sender: jsonRpc?.transaction?.data?.sender,
      kind: programmableTransaction
        ? { data: { oneofKind: 'programmableTransaction', programmableTransaction } }
        : undefined
    },
    events: {
      events: (jsonRpc?.events ?? []).map((e: any) => ({
        packageId: e.packageId,
        module: e.transactionModule,
        sender: e.sender,
        eventType: e.type,
        json: e.parsedJson
      }))
    },
    checkpoint: jsonRpc?.checkpoint != null ? BigInt(jsonRpc.checkpoint) : undefined
  }
}
