import { Event, MoveResource, EntryFunctionPayloadResponse } from '@aptos-labs/ts-sdk'

import { DecodedStruct } from '@typemove/move'

export type TypedEventInstance<T> = DecodedStruct<Event, T>
export type TypedMoveResource<T> = DecodedStruct<MoveResource, T>

// Don't use intermediate type to make IDE happier
export type TypedFunctionPayload<T extends Array<any>> = EntryFunctionPayloadResponse & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}
