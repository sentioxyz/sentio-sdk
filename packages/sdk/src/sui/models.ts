import { MoveEvent } from '@mysten/sui.js'

// export type MoveEvent = MoveEvent & {
// }

//
export type TypedEventInstance<T> = MoveEvent & {
  /**
   * decoded data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  fields_decoded: T

  type_arguments: string[]
}

//
// // Don't use intermediate type to make IDE happier
// export type TypedEntryFunctionPayload<T extends Array<any>> = TransactionPayload_EntryFunctionPayload & {
//   /**
//    * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
//    */
//   arguments_decoded: T
// }
//
// export type TypedMoveResource<T> = MoveResource & {
//   data_decoded: T
//   type_arguments: string[]
// }
//
// export interface StructWithTag {
//   type: string
//   data: any
// }
//
// export interface StructWithType<T> extends StructWithTag {
//   data_decoded: T
//   type_arguments: string[]
// }
