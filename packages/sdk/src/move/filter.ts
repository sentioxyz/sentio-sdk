// TODO extends ArgumentsFilter
import { MoveFetchConfig, ProcessResult } from '@sentio/protos'

export interface EventFilter {
  type: string
  account?: string
}

export interface FunctionNameAndCallFilter extends CallFilter {
  function: string
}

export interface TransactionFilter {
  includeFailed?: boolean
  publicKeyPrefix?: string
  fromAndToAddress?: { from: string; to: string }
}

// TODO extends ArgumentsFilter
export interface CallFilter extends TransactionFilter {
  typeArguments?: string[]
}

export interface ArgumentsFilter {
  arguments?: string[]
}

export class EventHandler<T> {
  filters: EventFilter[]
  handler: (event: T) => Promise<ProcessResult>
  fetchConfig: MoveFetchConfig
}

export class CallHandler<T> {
  filters: FunctionNameAndCallFilter[]
  handler: (call: T) => Promise<ProcessResult>
  fetchConfig: MoveFetchConfig
}

export class ObjectChangeHandler<T> {
  handler: (call: T) => Promise<ProcessResult>
  type: string
}

export class ResourceChangeHandler<T> {
  handler: (call: T) => Promise<ProcessResult>
  type: string
}
