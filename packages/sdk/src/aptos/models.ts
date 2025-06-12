import { DecodedStruct } from '@typemove/move'
import {
  Event,
  MoveResource,
  EntryFunctionPayloadResponse,
  UserTransactionResponse,
  BlockMetadataTransactionResponse,
  StateCheckpointTransactionResponse,
  ValidatorTransactionResponse,
  BlockEpilogueTransactionResponse
} from '@aptos-labs/ts-sdk'
import { MoveFetchConfig } from '@sentio/protos'

export type GeneralTransactionResponse =
  | UserTransactionResponse
  | BlockMetadataTransactionResponse
  | StateCheckpointTransactionResponse
  | ValidatorTransactionResponse
  | BlockEpilogueTransactionResponse

export type TypedEventInstance<T> = DecodedStruct<Event, T>
export type TypedMoveResource<T> = DecodedStruct<MoveResource, T>

// Don't use intermediate type to make IDE happier
export type TypedFunctionPayload<T extends Array<any>> = EntryFunctionPayloadResponse & {
  /**
   * decoded argument data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  arguments_decoded: T
}

export type PartitionHandler<D> = (data: D) => string | Promise<string>

export type HandlerOptions<D> = Partial<MoveFetchConfig> & {
  partitionKey?: string | PartitionHandler<D>
}
