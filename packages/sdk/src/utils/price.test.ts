import { describe, test, mock } from 'node:test'
import { getPriceByTypeOrSymbolInternal, getPriceClient } from './price.js'
import { GetPriceRequest, GetPriceResponse } from '@sentio/protos/price'
import { expect } from 'chai'

describe('price client', () => {
  const client = getPriceClient()

  test('get price', async () => {
    let priceValue = 1
    mock.method(client, 'getPrice', (request: GetPriceRequest) => {
      return Promise.resolve(
        GetPriceResponse.create({
          timestamp: new Date(),
          price: priceValue++
        })
      )
    })

    for (let i = 0; i < 1000; i++) {
      const x = getPriceByTypeOrSymbolInternal(client, new Date(), { symbol: 'BTC' })
      expect(await x).eq(i + 1)
    }
    // const y =  getPriceByTypeOrSymbolInternal(client, new Date(), { symbol: "BTC" })
    // expect(await y).eq(2)
  })
})
