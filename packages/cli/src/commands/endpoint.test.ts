import { describe, test } from 'node:test'
import { expect } from 'chai'
import {
  buildCurlCommand,
  buildEndpointInvocation,
  parseEndpointArgSchema,
  parseEndpointArgValues,
  toRichValueTemplate
} from './endpoint.js'

describe('endpoint command helpers', () => {
  test('parseEndpointArgSchema maps supported types to rich value templates', () => {
    expect(parseEndpointArgSchema('{"a":"string","b":"int","c":"datetime","d":"bool"}')).deep.equal({
      a: { stringValue: '' },
      b: { floatValue: 0 },
      c: { timestampValue: '' },
      d: { boolValue: false }
    })
  })

  test('parseEndpointArgValues parses values as a plain object', () => {
    expect(parseEndpointArgValues('{"min_amount":1000,"symbol":"ETH"}')).deep.equal({
      min_amount: 1000,
      symbol: 'ETH'
    })
  })

  test('toRichValueTemplate rejects unsupported types', () => {
    expect(() => toRichValueTemplate('enum')).to.throw('Unsupported argument type "enum"')
  })

  test('buildEndpointInvocation maps args into path, query, and body', () => {
    const invocation = buildEndpointInvocation(
      {
        endpointUrl: 'https://endpoint.sentio.xyz/sentio/coinbase/transfers/:account',
        method: 'POST',
        pathParameters: [{ name: 'account', required: true }],
        queryParameters: [{ name: 'limit' }],
        bodyParameters: [{ name: 'min_amount' }, { name: 'symbol' }]
      },
      {
        account: '0xabc',
        limit: 10,
        min_amount: 1000,
        symbol: 'ETH'
      }
    )

    expect(invocation).deep.equal({
      method: 'POST',
      url: 'https://endpoint.sentio.xyz/sentio/coinbase/transfers/0xabc?limit=10',
      body: {
        min_amount: 1000,
        symbol: 'ETH'
      }
    })
  })

  test('buildCurlCommand renders placeholders for docs parameters', () => {
    const command = buildCurlCommand({
      endpointUrl: 'https://endpoint.sentio.xyz/sentio/coinbase/transfers/:account',
      method: 'POST',
      pathParameters: [{ name: 'account' }],
      queryParameters: [{ name: 'limit' }, { name: 'cursor', required: true }],
      bodyParameters: [{ name: 'min_amount' }]
    })

    expect(command).contains(
      "curl 'https://endpoint.sentio.xyz/sentio/coinbase/transfers/<account>?cursor=%3Ccursor%3E'"
    )
    expect(command).not.contains('limit=%3Climit%3E')
    expect(command).contains('-X POST')
    expect(command).contains("-H 'Api-Key: <API_KEY>'")
    expect(command).contains(`-d '{"min_amount":"<min_amount>"}'`)
  })

  test('buildEndpointInvocation falls back to POST when docs method is blank', () => {
    const invocation = buildEndpointInvocation(
      {
        endpointUrl: 'https://endpoint.sentio.xyz/sentio/coinbase/recent_ts',
        method: ''
      },
      {}
    )

    expect(invocation.method).eq('POST')
  })
})
