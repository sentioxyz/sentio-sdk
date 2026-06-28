import { describe, test } from 'node:test'
import { assert, expect } from 'chai'
import { Interface } from 'ethers'

import { fixEmptyKey } from './index.js'
import { newInterface, sanitizeAbi } from './eth.js'
import { GLOBAL_CONFIG } from '@sentio/runtime'

GLOBAL_CONFIG.execution = {
  sequential: false
}

describe('eth test', () => {
  test('event encoding', async () => {
    const abi = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: '',
            type: 'address'
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256'
          }
        ],
        name: 'Harvest',
        type: 'event'
      }
    ]

    const iface = new Interface(abi)
    const encodedLog = iface.encodeEventLog('Harvest(address,uint256)', [
      '0x634316eA0EE79c701c6F67C53A4C54cBAfd2316d',
      1111n
    ])

    const parsed = iface.parseLog(encodedLog)
    assert(parsed)

    const args = fixEmptyKey(parsed)

    expect(args.toArray().length).equals(2)

    const object = args.toObject()
    expect(object).eqls({
      arg0: '0x634316eA0EE79c701c6F67C53A4C54cBAfd2316d',
      amount: 1111n
    })

    expect(args.toArray()[0]).equals('0x634316eA0EE79c701c6F67C53A4C54cBAfd2316d')
    expect(args.arg0).equals('0x634316eA0EE79c701c6F67C53A4C54cBAfd2316d')

    expect(args.toArray()[1]).equals(1111n)
    expect(args.amount).equals(1111n)
  })

  test('newInterface preserves fragments carrying a redundant indexed:false', () => {
    const abi = [
      {
        inputs: [{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ]

    // upstream ethers treats `indexed` on a function param as an Invalid Fragment and
    // silently DROPS it (logging a warning), so the function would be lost ...
    expect(new Interface(abi as any).fragments.length).equals(0)
    // ... newInterface() strips the redundant flag first so the function survives.
    const iface = newInterface(abi as any)
    assert(iface.getFunction('deposit'))
  })

  test('sanitizeAbi drops indexed:false but keeps indexed:true', () => {
    const cleaned: any = sanitizeAbi([
      {
        type: 'event',
        name: 'E',
        inputs: [
          { indexed: true, name: 'a', type: 'address' },
          { indexed: false, name: 'b', type: 'uint256' }
        ]
      }
    ] as any)
    expect(cleaned[0].inputs[0].indexed).equals(true)
    expect('indexed' in cleaned[0].inputs[1]).equals(false)
  })
})
