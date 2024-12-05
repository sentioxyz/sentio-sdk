import { describe, test } from 'node:test'
import { expect } from 'chai'
import { getTokenInfoWithFallback } from './token.js'

describe('coin test', () => {
  test('get coin info', async () => {
    const info = await getTokenInfoWithFallback(
      '0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2::assets_v1::EchoCoin002'
    )

    expect(info.decimals).to.eq(6)
  })

  test('have both token', async () => {
    const info = await getTokenInfoWithFallback('0xa491095e3906fbca27b6fb7345d4ea407282c1aecbd50b2d2a42b1fa977bae30')
    expect(info.tokenAddress).to.eq('0x8512b34017e087c3707748869ddc317d83f3fe70ab3a162abdc055c761ca9906::OBOT::OBOT')

    const info2 = await getTokenInfoWithFallback(
      '0x8512b34017e087c3707748869ddc317d83f3fe70ab3a162abdc055c761ca9906::OBOT::OBOT'
    )
    expect(info2.faAddress).to.eq('0xa491095e3906fbca27b6fb7345d4ea407282c1aecbd50b2d2a42b1fa977bae30')
  })
})
