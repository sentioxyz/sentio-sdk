import { describe, test } from 'node:test'
import { assert } from 'chai'
import { compareSemver, parseSemver } from './utils.js'

describe('semver parse tests', () => {
  test('should parse valid semver strings correctly', () => {
    const version = '1.2.3-alpha.1+build.123'
    const result = parseSemver(version)
    assert.deepEqual(result, {
      semVer: '1.2.3-alpha.1+build.123',
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'alpha.1',
      buildmetadata: 'build.123'
    })
  })

  test('should handle semver strings without build metadata', () => {
    const version = '1.2.3-rc.4'
    const result = parseSemver(version)
    assert.deepEqual(result, {
      semVer: '1.2.3-rc.4',
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'rc.4',
      buildmetadata: undefined
    })
  })

  test('should handle semver strings without prerelease and build metadata', () => {
    const version = '1.2.3'
    const result = parseSemver(version)
    assert.deepEqual(result, {
      semVer: '1.2.3',
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: undefined,
      buildmetadata: undefined
    })
  })

  test('should return undefined for invalid semver strings', () => {
    const version = 'invalid.version.string'
    const result = parseSemver(version)
    assert.deepEqual(result, {
      semVer: undefined,
      major: NaN,
      minor: NaN,
      patch: NaN,
      prerelease: undefined,
      buildmetadata: undefined
    })
  })

  test('compareSemver should return 0 for equal versions', () => {
    const a = parseSemver('1.2.3')
    const b = parseSemver('1.2.3')
    const result = compareSemver(a, b)
    assert.equal(result, 0)
  })

  test('compareSemver should return negative for a < b', () => {
    const a = parseSemver('2.54.0-rc.7')
    const b = parseSemver('2.54.0-rc.10')
    const result = compareSemver(a, b)
    assert.isTrue(result < 0)
  })

  test('compareSemver should return positive for a > b', () => {
    const a = parseSemver('1.2.4-rc.2')
    const b = parseSemver('1.2.4')
    const result = compareSemver(a, b)
    assert.isTrue(result > 0)
  })
})
