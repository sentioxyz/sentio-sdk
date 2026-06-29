import { describe, test, mock, TestContext } from 'node:test'
import { getPriceByTypeOrSymbolInternal, getPriceClient } from './price.js'
import { GetPriceResponseSchema } from '@sentio/api/gen/service/price/protos/price_pb.js'
import { CoinIDSchema } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { timestampFromDate } from '@bufbuild/protobuf/wkt'

describe('price client', () => {
  const client = getPriceClient()

  test('get price', async (t) => {
    let priceValue = 1
    mock.method(client, 'getPrice', () => {
      return Promise.resolve(
        create(GetPriceResponseSchema, {
          timestamp: timestampFromDate(new Date()),
          price: priceValue++
        })
      )
    })

    for (let i = 0; i < 1000; i++) {
      const x = getPriceByTypeOrSymbolInternal(
        client,
        new Date(),
        create(CoinIDSchema, { id: { case: 'symbol', value: 'BTC' } })
      )
      t.assert.equal(await x, i + 1)
    }
    // const y =  getPriceByTypeOrSymbolInternal(client, new Date(), { symbol: "BTC" })
    // expect(await y).eq(2)
  })

  test('get price from server', async (t: TestContext) => {
    const price = await getPriceByTypeOrSymbolInternal(
      client,
      new Date(),
      create(CoinIDSchema, { id: { case: 'symbol', value: 'ETH' } })
    )
    t.assert.ok(price && price > 0)
  })
})
