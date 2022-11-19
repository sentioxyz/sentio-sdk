import { Event, MoveResource, TransactionPayload_EntryFunctionPayload } from 'aptos-sdk/src/generated'

export type EventInstance = Event & {
  version: string
}

export type TypedEventInstance<T> = EventInstance & {
  // Typed data converted from ABI
  // undefined if there is converting error, usually because the ABI/data
  // mismatch
  data_typed: T

  type_arguments: string[]
}

// Don't use intermedidate type to make IDE happier
export type TypedEntryFunctionPayload<T extends Array<any>> = TransactionPayload_EntryFunctionPayload & {
  arguments_typed: T
}

export type TypedMoveResource<T> = MoveResource & {
  data_typed: T
  type_arguments: string[]
}

export interface StructWithTag {
  type: string
  data: any
}

export interface StructWithType<T> extends StructWithTag {
  data_typed: T
  type_arguments: string[]
}
