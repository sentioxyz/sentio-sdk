import type { IotaEvent, MoveCallIotaTransaction, IotaMoveObject } from '@iota/iota-sdk/client'
import { DecodedStruct } from '@typemove/move'

export type TypedEventInstance<T> = DecodedStruct<IotaEvent, T>
export type TypedIotaMoveObject<T> = DecodedStruct<IotaMoveObject, T>

export type TypedFunctionPayload<T extends Array<any>> = MoveCallIotaTransaction & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}

export type { PartitionHandler, HandlerOptions } from '../core/index.js'
