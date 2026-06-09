import { type EthCallParam, type ProcessResult, ProcessResultSchema, StateResultSchema } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { createRequire } from 'module'

import { Required } from 'utility-types'
import path from 'path'
import fs from 'fs'

export function mergeProcessResults(results: ProcessResult[]): Required<ProcessResult, 'states'> {
  const res = create(ProcessResultSchema, {
    states: create(StateResultSchema)
  })
  return mergeProcessResultsInPlace(res, results)
}

export function mergeProcessResultsInPlace(
  res: ProcessResult,
  results: ProcessResult[]
): Required<ProcessResult, 'states'> {
  res.states = res.states || create(StateResultSchema)
  for (const r of results) {
    // not using spread operator since it puts all element on the stack
    // cause maximum call stack size exceeded error if it's a large array

    res.counters = mergeArrayInPlace(res.counters, r.counters)
    res.gauges = mergeArrayInPlace(res.gauges, r.gauges)
    res.events = mergeArrayInPlace(res.events, r.events)
    res.exports = mergeArrayInPlace(res.exports, r.exports)
    res.timeseriesResult = mergeArrayInPlace(res.timeseriesResult, r.timeseriesResult)
    res.states = create(StateResultSchema, {
      configUpdated: res.states?.configUpdated || r.states?.configUpdated || false
    })
  }
  return res as Required<ProcessResult, 'states'>
}

function mergeArrayInPlace<T>(dst: T[], src: T[]): T[] {
  const res = dst || []
  if (Array.isArray(src)) {
    for (const r of src) {
      res.push(r)
    }
  }
  return res
}

export function errorString(e: unknown): string {
  if (e instanceof Error) {
    return e.message + '\n' + e.stack
  }
  return String(e)
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

const require = createRequire(import.meta.url)

export function locatePackageJson(pkgId: string) {
  const m = require.resolve(pkgId)

  let dir = path.dirname(m)
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    dir = path.dirname(dir)
  }
  const content = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')
  return JSON.parse(content)
}
