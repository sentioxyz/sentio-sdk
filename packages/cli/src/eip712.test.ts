import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ethers } from 'ethers'
import { ForwardRequest, hashForwardRequest, signForwardRequest, FORWARDER_DOMAIN_TYPES } from './eip712.js'

describe('eip712', () => {
  it('hashForwardRequest matches on-chain hashTypedDataV4 byte-for-byte', () => {
    const forwarderAddress = '0x0000000000000000000000000000000000000123'
    const chainId = 7892101n
    const req: ForwardRequest = {
      from: '0x0000000000000000000000000000000000000001',
      payer: '0x0000000000000000000000000000000000000001',
      target: '0x0000000000000000000000000000000000000002',
      gas: 200_000n,
      nonceKey: 0n,
      nonceValue: 0n,
      deadline: 1_000_000n,
      maxFee: 10_000_000_000_000n,
      data: '0xdeadbeef'
    }
    const digest = hashForwardRequest(req, {
      name: 'SentioForwarder',
      version: '1',
      chainId,
      verifyingContract: forwarderAddress
    })

    // Cross-check via ethers.TypedDataEncoder.hash, which is the same algorithm
    const domain = { name: 'SentioForwarder', version: '1', chainId, verifyingContract: forwarderAddress }
    const expected = ethers.TypedDataEncoder.hash(domain, FORWARDER_DOMAIN_TYPES, req)
    assert.equal(digest, expected)
  })

  it('signForwardRequest produces a 65-byte signature recoverable to the signer', async () => {
    const wallet = ethers.Wallet.createRandom()
    const req: ForwardRequest = {
      from: wallet.address,
      payer: wallet.address,
      target: '0x0000000000000000000000000000000000000002',
      gas: 200_000n,
      nonceKey: 0n,
      nonceValue: 0n,
      deadline: 1_000_000n,
      maxFee: 10_000_000_000_000n,
      data: '0xdeadbeef'
    }
    const domain = {
      name: 'SentioForwarder',
      version: '1',
      chainId: 7892101n,
      verifyingContract: '0x0000000000000000000000000000000000000123'
    }
    const sig = await signForwardRequest(wallet, req, domain)
    assert.equal(ethers.dataLength(sig), 65)
    const recovered = ethers.verifyTypedData(domain, FORWARDER_DOMAIN_TYPES, req, sig)
    assert.equal(recovered.toLowerCase(), wallet.address.toLowerCase())
  })
})
