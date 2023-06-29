import { expect } from 'chai'
import { accountAddressString, accountTypeString } from './utils.js'

describe('util tests', () => {
  test('to type string', () => {
    let res: string
    res = accountTypeString('0x000001')
    expect(res).eq('0x1')

    res = accountTypeString('000001')
    expect(res).eq('0x1')

    res = accountTypeString('0x1')
    expect(res).eq('0x1')

    res = accountTypeString('0x010')
    expect(res).eq('0x10')
  })

  test('to address string', () => {
    let res: string
    res = accountAddressString('0x000001')
    expect(res).eq('0x0000000000000000000000000000000000000000000000000000000000000001')

    res = accountAddressString('000001')
    expect(res).eq('0x0000000000000000000000000000000000000000000000000000000000000001')

    res = accountAddressString('0x1')
    expect(res).eq('0x0000000000000000000000000000000000000000000000000000000000000001')

    res = accountAddressString('0x010')
    expect(res).eq('0x0000000000000000000000000000000000000000000000000000000000000010')
  })
})
