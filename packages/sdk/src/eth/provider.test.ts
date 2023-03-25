import { getNetworkFromCtxOrNetworkish } from './provider.js'
import { expect } from 'chai'
import { AccountContext } from './context.js'

describe('provider test', () => {
  test('network test with string', async () => {
    const n = getNetworkFromCtxOrNetworkish('321')
    expect(n.chainId).eq(321n)
  })

  test('network test with id', async () => {
    const n = getNetworkFromCtxOrNetworkish(321)
    expect(n.chainId).eq(321n)
  })

  test('network test with context', async () => {
    const ctx = new AccountContext(321, '0x1')
    const n = getNetworkFromCtxOrNetworkish(ctx)
    expect(n.chainId).eq(321n)
  })
})
