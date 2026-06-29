import { describe, test } from 'node:test'
import { expect } from 'chai'
import { isSdkVersionCompatible } from './utils.js'

describe('isSdkVersionCompatible', () => {
  test('rejects an sdk whose major differs from the cli', () => {
    // older sdk
    expect(isSdkVersionCompatible('4.0.1-rc.4', '3.7.0')).equal(false)
    expect(isSdkVersionCompatible('4.0.0', '3.0.0')).equal(false)
    // newer sdk — a mismatch in either direction is rejected
    expect(isSdkVersionCompatible('4.0.0', '5.0.0')).equal(false)
    expect(isSdkVersionCompatible('5.2.0', '4.9.9')).equal(false)
  })

  test('accepts an sdk whose major matches the cli (including prereleases)', () => {
    expect(isSdkVersionCompatible('4.0.1-rc.4', '4.0.0')).equal(true)
    expect(isSdkVersionCompatible('4.0.1-rc.4', '4.1.0-rc.2')).equal(true)
    expect(isSdkVersionCompatible('4.0.0', '4.1.2')).equal(true)
  })

  test('treats development builds as compatible', () => {
    expect(isSdkVersionCompatible('3.0.0-development', '4.0.0')).equal(true)
    expect(isSdkVersionCompatible('4.0.0', '3.0.0-development')).equal(true)
    expect(isSdkVersionCompatible('3.0.0-development', '3.0.0-development')).equal(true)
  })

  test('treats unparseable versions as compatible (no false positives)', () => {
    expect(isSdkVersionCompatible('latest', '3.7.0')).equal(true)
    expect(isSdkVersionCompatible('4.0.0', 'workspace:^')).equal(true)
  })
})
