import { describe, test } from 'node:test'
import { expect } from 'chai'
import {
  buildDataQueryBody,
  buildEventsInsightQueryBody,
  formatStructuredOutput,
  buildMetricsInsightQueryBody,
  buildPriceInsightQueryBody,
  buildSqlExecuteBody,
  buildTimeRangeLite,
  formatDataOutput
} from './data.js'

describe('data command helpers', () => {
  test('buildTimeRangeLite applies defaults', () => {
    expect(buildTimeRangeLite({})).deep.equal({
      start: 'now-7d',
      end: 'now',
      step: 3600,
      timezone: undefined
    })
  })

  test('buildEventsInsightQueryBody creates event query payload', () => {
    const body = buildEventsInsightQueryBody('Transfer', { limit: 10, timezone: 'UTC', aggr: 'total' })
    expect(body.queries[0].dataSource).eq('EVENTS')
    expect((body.queries[0] as any).eventsQuery.resource.name).eq('Transfer')
    expect(body.timeRange.timezone).eq('UTC')
  })

  test('buildMetricsInsightQueryBody creates metrics query payload', () => {
    const body = buildMetricsInsightQueryBody('volume_total', {
      start: 'now-1d',
      end: 'now',
      step: 60,
      filter: ['chain=1'],
      groupBy: ['token'],
      aggr: 'avg'
    })
    expect(body.queries[0].dataSource).eq('METRICS')
    expect((body.queries[0] as any).metricsQuery.query).eq('volume_total')
    expect((body.queries[0] as any).metricsQuery.labelSelector).deep.equal({ chain: '1' })
    expect((body.queries[0] as any).metricsQuery.aggregate).deep.equal({
      op: 'AVG',
      grouping: ['token']
    })
    expect(body.timeRange.step).eq(60)
  })

  test('buildDataQueryBody creates event query payload from flags', () => {
    const body = buildDataQueryBody({
      event: 'Transfer',
      filter: ['from:0xabc', 'amount>0'],
      groupBy: ['timestamp'],
      aggr: 'DAU',
      func: ['bottomk(1)', 'delta(1m)'],
      limit: 20,
      timezone: 'UTC'
    })
    expect(body).to.not.equal(undefined)
    expect(body?.queries[0].dataSource).eq('EVENTS')
    expect((body?.queries[0] as any).eventsQuery.resource.name).eq('Transfer')
    expect((body?.queries[0] as any).eventsQuery.groupBy).deep.equal(['timestamp'])
    expect((body?.queries[0] as any).eventsQuery.aggregation).deep.equal({
      countUnique: {
        duration: {
          value: 1,
          unit: 'd'
        }
      }
    })
    expect(((body?.queries[0] as any).eventsQuery.selectorExpr as any)?.logicExpr?.operator).eq('AND')
    expect((body?.queries[0] as any).eventsQuery.functions).deep.equal([
      {
        name: 'bottomk',
        arguments: [{ intValue: 1 }]
      },
      {
        name: 'delta',
        arguments: [
          {
            durationValue: {
              value: 1,
              unit: 'm'
            }
          }
        ]
      }
    ])
  })

  test('buildDataQueryBody creates metrics query payload from flags', () => {
    const body = buildDataQueryBody({
      metric: 'cbETH_price',
      filter: ['token=cbETH', 'meta.chain:1'],
      groupBy: ['meta.address'],
      aggr: 'max',
      func: ['delta(1m)'],
      limit: 20,
      timezone: 'UTC'
    })
    expect(body).to.not.equal(undefined)
    expect(body?.queries[0].dataSource).eq('METRICS')
    expect((body?.queries[0] as any).metricsQuery.query).eq('cbETH_price')
    expect((body?.queries[0] as any).metricsQuery.labelSelector).deep.equal({
      token: 'cbETH',
      'meta.chain': '1'
    })
    expect((body?.queries[0] as any).metricsQuery.aggregate).deep.equal({
      op: 'MAX',
      grouping: ['meta.address']
    })
    expect((body?.queries[0] as any).metricsQuery.functions).deep.equal([
      {
        name: 'delta',
        arguments: [
          {
            durationValue: {
              value: 1,
              unit: 'm'
            }
          }
        ]
      }
    ])
  })

  test('buildDataQueryBody defaults metric grouping aggregation to AVG', () => {
    const body = buildDataQueryBody({
      metric: 'burn',
      groupBy: ['chain']
    })
    expect((body?.queries[0] as any).metricsQuery.aggregate).deep.equal({
      op: 'AVG',
      grouping: ['chain']
    })
  })

  test('buildPriceInsightQueryBody creates price query payload', () => {
    const body = buildPriceInsightQueryBody(['ETH', '1:0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2'], {
      start: 'now-1d',
      end: 'now',
      step: 300
    })
    expect(body.queries[0].dataSource).eq('PRICE')
    expect((body.queries[0] as any).priceQuery.coinId).deep.equal([
      { symbol: 'ETH' },
      {
        address: {
          chain: '1',
          address: '0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2'
        }
      }
    ])
  })

  test('buildDataQueryBody creates price query payload from flags', () => {
    const body = buildDataQueryBody({
      price: ['ETH'],
      alias: 'ETH'
    })
    expect(body?.queries[0].dataSource).eq('PRICE')
    expect((body?.queries[0] as any).priceQuery).deep.include({
      id: 'price',
      alias: 'ETH'
    })
  })

  test('buildSqlExecuteBody includes cache policy and engine', () => {
    const body = buildSqlExecuteBody({
      query: 'select 1',
      noCache: true,
      cacheTtlSecs: 60,
      cacheRefreshTtlSecs: 10,
      engine: 'CLICKHOUSE'
    })
    expect(body.sqlQuery).deep.equal({
      sql: 'select 1'
    })
    expect(body.cachePolicy).deep.equal({
      noCache: true,
      cacheTtlSecs: 60,
      cacheRefreshTtlSecs: 10
    })
    expect(body.engine).eq('CLICKHOUSE')
  })

  test('formatDataOutput formats events list', () => {
    const output = formatDataOutput({
      events: [
        {
          name: 'Transfer',
          displayName: 'Transfer',
          properties: [
            { name: 'amount', type: 'NUMBER' },
            { name: 'from', type: 'STRING' }
          ]
        },
        { name: 'Approval', displayName: 'Approval', properties: [{ name: 'owner', type: 'STRING' }] }
      ]
    })
    expect(output).contains('Events (2)')
    expect(output).contains('- Transfer')
    expect(output).contains('   properties: amount(NUMBER), from')
    expect(output).contains('- Approval')
    expect(output).contains('   properties: owner')
  })

  test('formatDataOutput formats query results as series tables', () => {
    const output = formatDataOutput({
      results: [
        {
          alias: 'cbETH_price',
          dataSource: 'METRICS',
          matrix: {
            samples: [
              {
                metric: { displayName: 'cbETH_price', labels: { token: 'cbETH' } },
                values: [
                  { timestamp: '1773194400', value: 2288.89 },
                  { timestamp: '1773198000', value: 2291.15 }
                ]
              }
            ]
          }
        }
      ]
    })
    expect(output).contains('cbETH_price [METRICS]')
    expect(output).contains('  - cbETH_price {token=cbETH}')
    expect(output).contains('timestamp')
    expect(output).contains('value')
    expect(output).contains('2026-03-11T02:00:00.000Z')
    expect(output).contains('2288.89')
    expect(output).contains('2291.15')
  })

  test('formatDataOutput formats SQL result tables', () => {
    const output = formatDataOutput({
      runtimeCost: '209',
      result: {
        columns: ['v'],
        rows: [{ v: 1 }]
      }
    })
    expect(output).contains('Runtime cost: 209 ms')
    expect(output).contains('v')
    expect(output).contains('1')
  })

  test('formatStructuredOutput formats yaml', () => {
    const output = formatStructuredOutput(
      {
        events: [{ name: 'Transfer', properties: [{ name: 'amount', type: 'NUMBER' }] }]
      },
      'yaml'
    )
    expect(output).contains('events:')
    expect(output).contains('name: Transfer')
    expect(output).contains('type: NUMBER')
  })
})
