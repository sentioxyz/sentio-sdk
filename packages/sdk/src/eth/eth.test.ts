import { assert, expect } from 'chai'
import { Interface } from 'ethers'

import { fixEmptyKey } from './index.js'
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
})
