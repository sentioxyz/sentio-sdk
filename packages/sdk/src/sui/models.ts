import type { SuiEvent, MoveCallSuiTransaction, SuiMoveObject } from '@mysten/sui/client'
import { DecodedStruct } from '@typemove/move'

export type TypedEventInstance<T> = DecodedStruct<SuiEvent, T>
export type TypedSuiMoveObject<T> = DecodedStruct<SuiMoveObject, T>

export type TypedFunctionPayload<T extends Array<any>> = MoveCallSuiTransaction & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}

export type { PartitionHandler, HandlerOptions } from '../core/index.js'
