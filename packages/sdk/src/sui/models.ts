import type { GrpcTypes } from '@mysten/sui/grpc'
import type { SuiEventInput, SuiMoveObjectInput } from '@typemove/sui'
import { DecodedStruct } from '@typemove/move'

export type TypedEventInstance<T> = DecodedStruct<SuiEventInput, T>
export type TypedSuiMoveObject<T> = DecodedStruct<SuiMoveObjectInput, T>

export type TypedFunctionPayload<T extends Array<any>> = GrpcTypes.MoveCall & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}

export type { PartitionHandler, HandlerOptions } from '../core/index.js'
