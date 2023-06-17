import { expect } from 'chai'
import { AccountContext } from './context.js'
import { EthChainId } from '@sentio/chain'

describe('provider test', () => {
  // test('network test with string', async () => {
  //   const n = getEthChainId('321')
  //   expect(n.chainId).eq(321n)
  // })

  // test('network test with id', async () => {
  //   const n = getEthChainId(321)
  //   expect(n.chainId).eq(321n)
  // })

  test('network test with context', async () => {
    const ctx = new AccountContext(EthChainId.KUCOIN, '0x1')
    const n = ctx.getChainId()
    expect(n).eq(EthChainId.KUCOIN)
  })
})
