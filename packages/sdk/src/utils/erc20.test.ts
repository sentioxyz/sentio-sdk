import { State, Endpoints } from '@sentio/runtime'
import { getERC20TokenInfo } from './token'
import { loadTestProvidersFromEnv } from '../testing/test-provider'

describe('erc20 tests', () => {
  State.reset()
  // Endpoints.reset()

  const haveProviders = loadTestProvidersFromEnv('1')

  const testIf = haveProviders ? test : test.skip

  testIf('test bytes32', async () => {
    const info = await getERC20TokenInfo('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')

    expect(info.decimal).toEqual(18)
    expect(info.symbol).toEqual('MKR')
    expect(info.name).toEqual('Maker')
  })

  testIf('test normal', async () => {
    const info = await getERC20TokenInfo('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')

    expect(info.decimal).toEqual(6)
    expect(info.symbol).toEqual('USDC')
    expect(info.name).toEqual('USD Coin')
  })
})
