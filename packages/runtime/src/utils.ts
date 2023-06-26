import { ProcessResult } from '@sentio/protos'
// TODO better handling this, because old proto doesn't have this
import { StateResult } from './gen/processor/protos/processor.js'

import { Required } from 'utility-types'

export function mergeProcessResults(results: ProcessResult[]): Required<ProcessResult, 'states'> {
  const res = {
    ...ProcessResult.create(),
    states: StateResult.create(),
  }

  for (const r of results) {
    res.counters = res.counters.concat(r.counters)
    res.gauges = res.gauges.concat(r.gauges)
    res.events = res.events.concat(r.events)
    res.exports = res.exports.concat(r.exports)
    res.states = {
      configUpdated: res.states?.configUpdated || r.states?.configUpdated || false,
    }
  }
  return res
}

export function errorString(e: Error): string {
  return e.message + '\n' + e.stack
}

export const USER_PROCESSOR = 'user_processor'
