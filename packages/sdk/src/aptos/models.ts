import { Event, MoveResource, TransactionPayload_EntryFunctionPayload } from './move-types.js'

export type EventInstance = Event & {
  version: string
}

export type TypedEventInstance<T> = EventInstance & {
  /**
   * decoded data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  data_decoded: T

  type_arguments: string[]
}

// Don't use intermediate type to make IDE happier
export type TypedEntryFunctionPayload<T extends Array<any>> = TransactionPayload_EntryFunctionPayload & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}

export type TypedMoveResource<T> = MoveResource & {
  data_decoded: T
  type_arguments: string[]
}
