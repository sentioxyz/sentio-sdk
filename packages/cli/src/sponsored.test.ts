import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ethers } from 'ethers'
import { buildForwardRequest, tryRelayerWithFailover } from './sponsored.js'

describe('sponsored helpers', () => {
  it('buildForwardRequest sets payer=from when no owner passed', () => {
    const wallet = ethers.Wallet.createRandom()
    const req = buildForwardRequest({
      signerAddress: wallet.address,
      target: '0x0000000000000000000000000000000000000099',
      data: '0xdeadbeef',
      gas: 200_000n,
      nonceKey: 0n,
      nonceValue: 0n,
      deadline: 1_000_000n,
      maxFee: 12n
    })
    assert.equal(req.from, wallet.address)
    assert.equal(req.payer, wallet.address)
  })

  it('buildForwardRequest sets payer=owner when owner provided', () => {
    const wallet = ethers.Wallet.createRandom()
    const owner = '0x0000000000000000000000000000000000000050'
    const req = buildForwardRequest({
      signerAddress: wallet.address,
      owner,
      target: '0x0000000000000000000000000000000000000099',
      data: '0xdeadbeef',
      gas: 200_000n,
      nonceKey: 0n,
      nonceValue: 0n,
      deadline: 1_000_000n,
      maxFee: 12n
    })
    assert.equal(req.from, wallet.address)
    assert.equal(req.payer, owner)
  })
})

describe('relayer failover', () => {
  it('tries next URL on transport failure', async () => {
    let calls = 0
    const fn = async (url: string) => {
      calls++
      if (url.endsWith(':1')) throw new Error('ECONNREFUSED')
      return { txHash: '0xok', blockNumber: 100 }
    }
    const result = await tryRelayerWithFailover(['http://a:1', 'http://b:2', 'http://c:3'], fn)
    assert.equal(result.txHash, '0xok')
    assert.equal(calls, 2)
  })

  it('throws after exhausting all URLs', async () => {
    const fn = async () => {
      throw new Error('boom')
    }
    await assert.rejects(() => tryRelayerWithFailover(['http://a:1', 'http://b:2'], fn), /failed to relay/)
  })

  it('does NOT failover when SENTIO_RELAYER_URL is set', async () => {
    process.env.SENTIO_RELAYER_URL = 'http://locked'
    try {
      let calls = 0
      const fn = async (_url: string) => {
        calls++
        throw new Error('boom')
      }
      await assert.rejects(() => tryRelayerWithFailover(['http://locked'], fn))
      assert.equal(calls, 1) // only tried once
    } finally {
      delete process.env.SENTIO_RELAYER_URL
    }
  })
})
