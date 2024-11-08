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
})
