import { MoveEvent, MoveCall } from '@mysten/sui.js'

export type TypedEventInstance<T> = MoveEvent & {
  /**
   * decoded data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  fields_decoded: T

  type_arguments: string[]
}

export type TypedFunctionPayload<T extends Array<any>> = MoveCall & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}
