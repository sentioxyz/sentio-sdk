import { describe, test } from 'node:test'
import { expect } from 'chai'
import { getFinalizedHost } from '../config.js'
import { getApiUrl } from '../utils.js'

describe('login command configuration', () => {
  test('--host test resolves to https://test.sentio.xyz', () => {
    expect(getFinalizedHost('test')).to.equal('https://test.sentio.xyz')
  })

  test('--host prod resolves to https://app.sentio.xyz', () => {
    expect(getFinalizedHost('prod')).to.equal('https://app.sentio.xyz')
  })

  test('--host staging resolves to https://staging.sentio.xyz', () => {
    expect(getFinalizedHost('staging')).to.equal('https://staging.sentio.xyz')
  })

  test('--host local resolves to http://localhost:10000', () => {
    expect(getFinalizedHost('local')).to.equal('http://localhost:10000')
  })

  test('undefined host defaults to prod', () => {
    expect(getFinalizedHost(undefined)).to.equal('https://app.sentio.xyz')
  })

  test('check_key URL is correct for test host', () => {
    const host = getFinalizedHost('test')
    const url = getApiUrl('/api/v1/processors/check_key', host)
    // sentio.xyz hosts have /api/ stripped and api-test prefix substituted
    expect(url.href).to.equal('https://api-test.sentio.xyz/v1/processors/check_key')
  })

  test('check_key URL is correct for prod host', () => {
    const host = getFinalizedHost('prod')
    const url = getApiUrl('/api/v1/processors/check_key', host)
    expect(url.href).to.equal('https://api.sentio.xyz/v1/processors/check_key')
  })
})
