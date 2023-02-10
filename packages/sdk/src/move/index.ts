// TODO extends ArgumentsFilter
import { Data_AptCall, Data_AptEvent, MoveFetchConfig, ProcessResult } from '@sentio/protos'

export interface EventFilter {
  type: string
  account?: string
}

export interface FunctionNameAndCallFilter extends CallFilter {
  function: string
}

// TODO extends ArgumentsFilter
export interface CallFilter {
  includeFailed?: boolean
  typeArguments?: string[]
}

export interface ArgumentsFilter {
  arguments?: string[]
}

export class EventHandler {
  filters: EventFilter[]
  handler: (event: Data_AptEvent) => Promise<ProcessResult>
  fetchConfig: MoveFetchConfig
}

export class CallHandler {
  filters: FunctionNameAndCallFilter[]
  handler: (call: Data_AptCall) => Promise<ProcessResult>
  fetchConfig: MoveFetchConfig
}
