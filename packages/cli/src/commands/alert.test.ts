import { describe, test } from 'node:test'
import { expect } from 'chai'
import { buildAlertRuleBodyFromSpec } from './alert.js'

describe('alert command helpers', () => {
  test('buildAlertRuleBodyFromSpec creates log alert payload', async () => {
    const body = await buildAlertRuleBodyFromSpec({
      projectId: 'project-1',
      type: 'LOG',
      subject: 'Large transfer logs',
      query: 'amount > 1000',
      op: '>',
      threshold: 0,
      for: '5m'
    })

    expect(body.rule).deep.include({
      projectId: 'project-1',
      alertType: 'LOG',
      subject: 'Large transfer logs'
    })
    expect(body.rule?.logCondition).deep.equal({
      query: 'amount > 1000',
      comparisonOp: '>',
      threshold: 0,
      threshold2: undefined
    })
    expect(body.rule?.for).deep.equal({
      value: 5,
      unit: 'm'
    })
  })

  test('buildAlertRuleBodyFromSpec creates inline metric alert payload', async () => {
    const body = await buildAlertRuleBodyFromSpec({
      projectId: 'project-1',
      type: 'METRIC',
      subject: 'Burn spike',
      metric: 'burn',
      filter: ['meta.chain=1'],
      groupBy: ['meta.address'],
      aggr: 'avg',
      op: '>',
      threshold: 100
    })

    expect(body.rule).deep.include({
      projectId: 'project-1',
      alertType: 'METRIC',
      subject: 'Burn spike'
    })
    const condition = body.rule?.condition as any
    expect(condition.comparisonOp).eq('>')
    expect(condition.threshold).eq(100)
    expect(condition.insightQueries).length(1)
    expect(condition.insightQueries[0].metricsQuery).deep.include({
      id: 'a',
      query: 'burn'
    })
    expect(condition.insightQueries[0].metricsQuery.labelSelector).deep.equal({
      'meta.chain': '1'
    })
  })

  test('buildAlertRuleBodyFromSpec creates metric alert payload from yaml-style multi-query spec', async () => {
    const body = await buildAlertRuleBodyFromSpec({
      projectId: 'project-1',
      type: 'METRIC',
      subject: 'Net flow anomaly',
      queries: [
        {
          id: 'a',
          metric: 'inflow',
          filter: ['meta.chain=1'],
          aggr: 'sum'
        },
        {
          id: 'b',
          metric: 'outflow',
          filter: ['meta.chain=1'],
          aggr: 'sum'
        }
      ],
      formula: 'a - b',
      op: '>',
      threshold: 100000,
      interval: '1m'
    })

    const condition = body.rule?.condition as any
    expect(condition.insightQueries).length(2)
    expect(condition.formula).deep.equal({
      expression: 'a - b',
      disabled: false
    })
    expect(body.rule?.interval).deep.equal({
      value: 1,
      unit: 'm'
    })
  })

  test('buildAlertRuleBodyFromSpec creates sql alert payload', async () => {
    const body = await buildAlertRuleBodyFromSpec({
      projectId: 'project-1',
      type: 'SQL',
      subject: 'Large transfer(SQL demo)',
      query: 'select timestamp, amount from transfer',
      timeColumn: 'timestamp',
      valueColumn: 'amount',
      sqlAggr: 'MAX',
      op: '>',
      threshold: 1000
    })

    expect(body.rule?.query).eq('select timestamp, amount from transfer')
    expect(body.rule?.sqlCondition).deep.equal({
      sqlQuery: 'select timestamp, amount from transfer',
      columnCondition: {
        valueColumn: 'amount',
        timeColumn: 'timestamp',
        comparisonOp: '>',
        threshold: 1000,
        threshold2: undefined,
        aggregation: 'MAX'
      }
    })
  })
})
