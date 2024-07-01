import assert from 'assert'
import { describe, test } from 'node:test'
import { State } from '@sentio/runtime'
import { getERC20TokenInfo } from './token.js'
import { loadTestProvidersFromEnv } from '../testing/test-provider.js'
import { EthChainId } from '@sentio/chain'

describe('erc20 tests', () => {
  State.reset()
  // Endpoints.reset()

  const haveProviders = loadTestProvidersFromEnv('1')

  const testIf = haveProviders ? test : test.skip

  testIf('test bytes32', async () => {
    const info = await getERC20TokenInfo(EthChainId.ETHEREUM, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')

    assert.equal(info.decimal, 18)
    assert.equal(info.symbol, 'MKR')
    assert.equal(info.name, 'Maker')
  })

  testIf('test normal', async () => {
    const info = await getERC20TokenInfo(EthChainId.ETHEREUM, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')

    assert.equal(info.decimal, 6)
    assert.equal(info.symbol, 'USDC')
    assert.equal(info.name, 'USD Coin')
  })
})
