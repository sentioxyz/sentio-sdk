import { ProcessResult } from '@sentio/protos'

export function mergeProcessResults(results: ProcessResult[]): ProcessResult {
  const res = ProcessResult.fromPartial({})

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
