import { Event, MoveResource, TransactionPayload_EntryFunctionPayload } from './move-types.js'
import { DecodedStruct } from '../move/types.js'

export type TypedEventInstance<T> = DecodedStruct<Event, T>
export type TypedMoveResource<T> = DecodedStruct<MoveResource, T>

// Don't use intermediate type to make IDE happier
export type TypedFunctionPayload<T extends Array<any>> = TransactionPayload_EntryFunctionPayload & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}
