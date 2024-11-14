import { T } from '../schema.js'
import { TypedActionProcessor } from '../typed-action-processor.js'
import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { ActionPlugin } from '../action-plugin.js'
import { ProcessConfigResponse } from '@sentio/protos'

describe('Test Action Example', () => {
  const plugin = new ActionPlugin()
  const fastify = plugin.server

  const schema = {
    body: T.object({
      name: T.string(),
      age: T.number()
    }),
    query: T.object({
      query: T.array(T.string())
    }),
    params: T.object({
      path: T.string()
    })
  }

  const GetSchema = { query: schema.query, params: schema.params }

  TypedActionProcessor.bind()
    .onPost('/echo/:path', schema, async (request) => {
      const body = request.body
      const queries = request.query
      const path = request.params?.path
      return { body, queries, path }
    })
    .onGet('/echo/:path', GetSchema, async (request) => {
      return { query: request.query, path: request.params?.path, headers: request.headers }
    })

  before(async () => {
    await plugin.configure(ProcessConfigResponse.fromPartial({}))
  })

  test('test post echo ', async () => {
    const testPayload = {
      name: 'test',
      age: 10
    }
    const res = await fastify.inject({
      method: 'POST',
      url: '/echo/test?query=1&query=2',
      payload: testPayload
    })

    expect(res.statusCode).to.equal(200)
    const body = JSON.parse(res.body)
    expect(body.body).to.deep.equal(testPayload)
    expect(body.queries).to.deep.equal({ query: ['1', '2'] })
    expect(body.path).to.equal('test')
  })

  test('test docs', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/_docs'
    })

    expect(res.statusCode).to.equal(200)
    const body = JSON.parse(res.body)[0]
    expect(body.method).to.equal('POST')
    expect(body.url).to.equal('/echo/:path')
  })
})
