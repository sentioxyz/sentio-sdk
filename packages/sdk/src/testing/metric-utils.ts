import type { MetricValue, ProcessResult, RichStruct, RichValue, TimeseriesResult } from '@sentio/protos'
import { TimeseriesResult_TimeseriesType } from '@sentio/protos'
import { Numberish, BigDecimal } from '../core/index.js'
import { bytesToBigInt } from '../utils/conversion.js'

export function MetricValueToNumber(v: MetricValue | undefined): Numberish | undefined {
  if (v === undefined) {
    return undefined
  }

  switch (v.value.case) {
    case 'doubleValue':
      return v.value.value
    case 'bigInteger': {
      let intValue = bytesToBigInt(v.value.value.data)
      if (v.value.value.negative) {
        intValue = -intValue
      }
      return intValue
    }
    case 'bigDecimal':
      return new BigDecimal(v.value.value)
    default:
      return undefined
  }
}

// The legacy gauges/counters/events fields were dropped in v4; metrics and events
// now travel exclusively as TimeseriesResult entries tagged by type. These helpers
// recover the per-type views (and values) that tests used to read off the legacy
// fields. The metric value lives at data.fields.value (see core/numberish.ts
// toTimeSeriesData); event payload fields are flattened into data.fields.
function RichValueToNumber(v: RichValue | undefined): Numberish | undefined {
  if (v === undefined) {
    return undefined
  }
  switch (v.value.case) {
    case 'floatValue':
      return v.value.value
    case 'bigintValue': {
      let intValue = bytesToBigInt(v.value.value.data)
      if (v.value.value.negative) {
        intValue = -intValue
      }
      return intValue
    }
    case 'bigdecimalValue': {
      const bd = v.value.value
      if (bd.value === undefined) {
        return undefined
      }
      let intValue = bytesToBigInt(bd.value.data)
      if (bd.value.negative) {
        intValue = -intValue
      }
      return new BigDecimal(`${intValue}e${bd.exp}`)
    }
    default:
      return undefined
  }
}

function timeseriesOf(result: ProcessResult | undefined, type: TimeseriesResult_TimeseriesType): TimeseriesResult[] {
  return result?.timeseriesResult.filter((t) => t.type === type) ?? []
}

export function countersOf(result: ProcessResult | undefined): TimeseriesResult[] {
  return timeseriesOf(result, TimeseriesResult_TimeseriesType.COUNTER)
}

export function gaugesOf(result: ProcessResult | undefined): TimeseriesResult[] {
  return timeseriesOf(result, TimeseriesResult_TimeseriesType.GAUGE)
}

export function eventsOf(result: ProcessResult | undefined): TimeseriesResult[] {
  return timeseriesOf(result, TimeseriesResult_TimeseriesType.EVENT)
}

// Read a string field off a TimeseriesResult's data struct (e.g. an event's
// `message` or a flattened payload attribute). Returns undefined if absent or
// not a string.
export function eventField(ts: TimeseriesResult | undefined, key: string): string | undefined {
  const v = ts?.data?.fields?.[key]?.value
  return v?.case === 'stringValue' ? v.value : undefined
}

// Convert a RichValue back to a plain JS value (inverse of core/normalization.ts
// normalizeToRichValue), so event payload fields — including nested structs — can
// be asserted with deep equality.
function richValueToJs(v: RichValue | undefined): unknown {
  if (v === undefined) {
    return undefined
  }
  switch (v.value.case) {
    case 'nullValue':
      return null
    case 'stringValue':
    case 'boolValue':
    case 'floatValue':
      return v.value.value
    case 'bigintValue': {
      let n = bytesToBigInt(v.value.value.data)
      if (v.value.value.negative) {
        n = -n
      }
      return n
    }
    case 'bigdecimalValue': {
      const bd = v.value.value
      if (bd.value === undefined) {
        return undefined
      }
      let n = bytesToBigInt(bd.value.data)
      if (bd.value.negative) {
        n = -n
      }
      return new BigDecimal(`${n}e${bd.exp}`)
    }
    case 'structValue':
      return richStructToJs(v.value.value)
    case 'listValue':
      return v.value.value.values.map(richValueToJs)
    default:
      return undefined
  }
}

function richStructToJs(s: RichStruct | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (s) {
    for (const [k, v] of Object.entries(s.fields)) {
      out[k] = richValueToJs(v)
    }
  }
  return out
}

// Read an arbitrary event payload field off a TimeseriesResult's data struct as a
// plain JS value (strings, bigints, nested objects, ...).
export function eventFieldValue(ts: TimeseriesResult | undefined, key: string): unknown {
  return richValueToJs(ts?.data?.fields?.[key])
}

function firstTimeseriesValue(
  result: ProcessResult | undefined,
  type: TimeseriesResult_TimeseriesType,
  name: string
): Numberish | undefined {
  for (const ts of timeseriesOf(result, type)) {
    if (ts.metadata?.name === name) {
      return RichValueToNumber(ts.data?.fields?.value)
    }
  }
  return undefined
}

export function firstCounterValue(result: ProcessResult | undefined, name: string): Numberish | undefined {
  return firstTimeseriesValue(result, TimeseriesResult_TimeseriesType.COUNTER, name)
}

export function firstGaugeValue(result: ProcessResult | undefined, name: string): Numberish | undefined {
  return firstTimeseriesValue(result, TimeseriesResult_TimeseriesType.GAUGE, name)
}
