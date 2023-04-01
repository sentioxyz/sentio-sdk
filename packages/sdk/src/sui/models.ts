import { SuiEvent, MoveCallSuiTransaction } from '@mysten/sui.js'

export type TypedEventInstance<T> = SuiEvent & {
  /**
   * decoded data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  data_decoded: T

  type_arguments: string[]
}

export type TypedFunctionPayload<T extends Array<any>> = MoveCallSuiTransaction & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}
