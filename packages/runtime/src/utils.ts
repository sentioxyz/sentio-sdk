import { EthCallParam, ProcessResult } from '@sentio/protos'

// TODO better handling this, because old proto doesn't have this
import { StateResult, ProcessResult as ProcessResultFull } from './gen/processor/protos/processor.js'

import { Required } from 'utility-types'

export function mergeProcessResults(results: ProcessResult[]): Required<ProcessResult, 'states'> {
  const res = {
    ...ProcessResultFull.create(),
    states: StateResult.create()
  }
  return mergeProcessResultsInPlace(res, results)
}

export function mergeProcessResultsInPlace(
  res: ProcessResult,
  results: ProcessResult[]
): Required<ProcessResult, 'states'> {
  res.states = res.states || StateResult.create()
  for (const r of results) {
    res.counters.push(...r.counters)
    res.gauges.push(...r.gauges)
    res.events.push(...r.events)
    res.exports.push(...r.exports)
    res.timeseriesResult.push(...r.timeseriesResult)
    res.states = {
      configUpdated: res.states?.configUpdated || r.states?.configUpdated || false
    }
  }
  return res
}

export function errorString(e: Error): string {
  return e.message + '\n' + e.stack
}

export const USER_PROCESSOR = 'user_processor'

export function makeEthCallKey(param: EthCallParam) {
  if (!param.context) {
    throw new Error('null context for eth call')
  }
  const { chainId, address, blockTag } = param.context
  return `${chainId}|${address}|${blockTag}|${param.calldata}`.toLowerCase()
}

export type Semver = {
  semVer?: string
  major: number
  minor: number
  patch: number
  prerelease?: string
  buildmetadata?: string
}

export function parseSemver(version: string): Semver {
  const [semVer, major, minor, patch, prerelease, buildmetadata] =
    version.match(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    ) ?? []
  return {
    semVer,
    major: parseInt(major),
    minor: parseInt(minor),
    patch: parseInt(patch),
    prerelease,
    buildmetadata
  }
}

export function compareSemver(a: Semver, b: Semver) {
  const { major: ma, minor: mia, patch: pa, prerelease: pra } = a
  const { major: mb, minor: mib, patch: pb, prerelease: prb } = b

  if (ma !== mb) {
    return ma - mb
  }
  if (mia !== mib) {
    return mia - mib
  }

  if (pa !== pb) {
    return pa - pb
  }
  if (pra && prb) {
    const [sa, va] = pra.split('.')
    const [sb, vb] = prb.split('.')

    if (sa !== sb) {
      return sa.localeCompare(sb)
    }

    return parseInt(va) - parseInt(vb)
  } else if (pra) {
    return -1
  } else if (prb) {
    return 1
  }
  return 0
}
