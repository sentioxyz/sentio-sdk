import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { TestProcessorServer } from '../../testing/index.js'
import { router } from './types/testnet/wisp.js'
import { SuiChainId } from '@sentio/chain'

describe('Test entry call decoding', () => {
  const service = new TestProcessorServer(async () => {
    router.bind().onEntrySwapExactInput_(async (call, ctx) => {
      ctx.meter.Counter('c').add(1)
    })
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
  })

  test('Check call dispatch', async () => {
    const res = await service.iota.testEntryFunctionCall(testData.result as any, SuiChainId.IOTA_TESTNET)
    expect(res.result?.counters).length(1)
  })
})

const testData = {
  jsonrpc: '2.0',
  result: {
    digest: '7ur5hCsSxn5TmG92JDfeBKenjLh5xJPqs8XdJBSnnzqm',
    transaction: {
      data: {
        messageVersion: 'v1',
        transaction: {
          kind: 'ProgrammableTransaction',
          inputs: [
            {
              type: 'object',
              objectType: 'immOrOwnedObject',
              objectId: '0x06879f269d1cc197d6c3ce689e2c86d5e2406c366faea2d34e2f8ef9232556a3',
              version: '478411',
              digest: '9jEDhCuREAcUh9rh8ZsX9kdoCJZpQpZEnWbzDEHt2bnK'
            },
            {
              type: 'object',
              objectType: 'immOrOwnedObject',
              objectId: '0x0ebab4cee5c86b4337065558198c2f6dde892e0bd52bbba27f6d2e553c5bb7c6',
              version: '5622396',
              digest: '3JwX6tE79nJug3ck2jBG6AEPi1iGqxiX6toXmJoQGyid'
            },
            {
              type: 'object',
              objectType: 'immOrOwnedObject',
              objectId: '0x22698b62ff6c28259b51c4802c935b224657661610c31acc1bb45d52499e24c2',
              version: '469083',
              digest: 'BJq4ExF3Ehf2hTZxYu11YAJJByF18yAz4giRBPgdYPsn'
            },
            {
              type: 'object',
              objectType: 'immOrOwnedObject',
              objectId: '0x4d938debc8b4fb532c9f7c1d34301c326781c6c1c303303d252e9f57472d2b18',
              version: '594975',
              digest: '9AQ6oqDbFSD1C7mYErKKqQfQXx3fExm3nk938zzHMFCE'
            },
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0x33dad3c4a8ec662326d69d94151ab157e26e621830cce125e97965a0111c37c4',
              initialSharedVersion: '1656',
              mutable: true
            },
            {
              type: 'pure',
              valueType: 'u64',
              value: '990000000'
            },
            {
              type: 'pure',
              valueType: 'u64',
              value: '2954564'
            }
          ],
          transactions: [
            {
              MakeMoveVec: [
                null,
                [
                  {
                    Input: 0
                  },
                  {
                    Input: 1
                  },
                  {
                    Input: 2
                  },
                  {
                    Input: 3
                  }
                ]
              ]
            },
            {
              MoveCall: {
                package: '0x6c4a21e3e7e6b6d51c4604021633e1d97e24e37a696f8c082cd48f37503e602a',
                module: 'router',
                function: 'swap_exact_input_',
                type_arguments: [
                  '0x2::sui::SUI',
                  '0x700de8dea1aac1de7531e9d20fc2568b12d74369f91b7fad3abc1c4f40396e52::bnb::BNB'
                ],
                arguments: [
                  {
                    Input: 4
                  },
                  {
                    Result: 0
                  },
                  {
                    Input: 5
                  },
                  {
                    Input: 6
                  }
                ]
              }
            }
          ]
        },
        sender: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b',
        gasData: {
          payment: [
            {
              objectId: '0x00f72ce3a935776b4acadb9b21520ab2812573f886ad8f6c40928399ccc7f69c',
              version: 5622396,
              digest: 'HtUgAogv6turQ2EVKWNEeD4P3Q9BDqgQup184Jk6wTZv'
            },
            {
              objectId: '0x5a525fb00a5b84d631982eb671f7381b630e4431440811cc06b0df6efc2f47a9',
              version: 849251,
              digest: '8ppcRaAxZURFmne96Aop12qPxqSx9eCLwAZ1Ab23q1Ta'
            },
            {
              objectId: '0x5bea010274fe0bbee4d316eb005638f7d5381ce4fb08e507ba2e5fe5eedb4e0e',
              version: 485289,
              digest: 'AvRkf6nV74rwLy6aosjRkQvpmcvdAZqzvztH3ifGVsPs'
            },
            {
              objectId: '0xbaa09a53c3a459d39a2356bf4f26f5777b9141290aafece4a733c0fe2a093587',
              version: 400971,
              digest: '6jgTKaDqpPrxEAbQdo5UAHgPFDSrvXrPteM8MPpQuuFY'
            },
            {
              objectId: '0xc7b574bc35d02a7b9de9d15e0b3afd75c2868272c9440bddd444f42e2ba3c575',
              version: 488872,
              digest: 'AZP4TeKLstyPQBQsHXq4tqk9gEwM5p5VGMZsiz66Jp73'
            }
          ],
          owner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b',
          price: '1000',
          budget: '200000000'
        }
      },
      txSignatures: [
        'ALpLZJUL3ehm8/2jT+zHJKAdUBR2XKg+YBswTJKjjJL6AGrHhYt3JPY10uf8NE+n4nDP3QLJmOmejYW96ZeB/w1h1Lp0/ALa07Hn4zHR5Yag4p55dMDZJMlN92cVbSnXxA=='
      ]
    },
    rawTransaction:
      'AQAAAAAABwEABoefJp0cwZfWw85oniyG1eJAbDZvrqLTTi+O+SMlVqPLTAcAAAAAACCBrtYDhbA62xPb+L/bRsjMpxjUH0HCiapWNhs4CZ4/pAEADrq0zuXIa0M3BlVYGYwvbd6JLgvVK7uif20uVTxbt8Z8ylUAAAAAACAiT+R2BCfdjeud2Bxio0SH4S7soqsUEHoxcpkdIOYXFgEAImmLYv9sKCWbUcSALJNbIkZXZhYQwxrMG7RdUkmeJMJbKAcAAAAAACCZJhR4mQoeVZakygxqnaqwXSfjQsjYrzt3COj/+WOxkQEATZON68i0+1Msn3wdNDAcMmeBxsHDAzA9JS6fV0ctKxgfFAkAAAAAACB5RdeTQkPAiGOF8e7SUznqft28R7dFmvI6bo2+YnS7AwEBM9rTxKjsZiMm1p2UFRqxV+JuYhgwzOEl6XlloBEcN8R4BgAAAAAAAAEACIAzAjsAAAAAAAhEFS0AAAAAAAIFAAQBAAABAQABAgABAwAAbEoh4+fmttUcRgQCFjPh2X4k43ppb4wILNSPN1A+YCoGcm91dGVyEXN3YXBfZXhhY3RfaW5wdXRfAgcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgNzdWkDU1VJAAdwDejeoarB3nUx6dIPwlaLEtdDafkbf606vBxPQDluUgNibmIDQk5CAAQBBAACAAABBQABBgB25MXJu+CdJx8wX4Q9uRhO75lI4AAtDoy+dvqsZPDcawUA9yzjqTV3a0rK25shUgqygSVz+Iatj2xAkoOZzMf2nHzKVQAAAAAAIPrq55j8WZWrFXOBfBSon86RRq4a28VZt+vumcMIIYF9WlJfsApbhNYxmC62cfc4G2MORDFECBHMBrDfbvwvR6lj9QwAAAAAACB0QfCuXi8pOtckel8N7ATCOGo3SRc2+lO7zzmVjVFURVvqAQJ0/gu+5NMW6wBWOPfVOBzk+wjlB7ouX+Xu204OqWcHAAAAAAAgk2j0BFKMagmEcFjOv0+ip47PEM0q6l77E6+Ou0chu4a6oJpTw6RZ05ojVr9PJvV3e5FBKQqv7OSnM8D+Kgk1h0seBgAAAAAAIFU5cG0BbP9Q5vO1mV5Jt9A8JHWuP83hhxn8tRe9bhoLx7V0vDXQKnud6dFeCzr9dcKGgnLJRAvd1ET0LiujxXWodQcAAAAAACCOBLYNuPLy/jW5R/SixYXoVEIxyFjJQOSR8V0JRYUh0nbkxcm74J0nHzBfhD25GE7vmUjgAC0OjL52+qxk8Nxr6AMAAAAAAAAAwusLAAAAAAABYQC6S2SVC93oZvP9o0/sxySgHVAUdlyoPmAbMEySo4yS+gBqx4WLdyT2NdLn/DRPp+Jwz90CyZjpno2FvemXgf8NYdS6dPwC2tOx5+Mx0eWGoOKeeXTA2STJTfdnFW0p18Q=',
    effects: {
      messageVersion: 'v1',
      status: {
        status: 'success'
      },
      executedEpoch: '40',
      gasUsed: {
        computationCost: '1000000',
        storageCost: '7341600',
        storageRebate: '12820896',
        nonRefundableStorageFee: '129504'
      },
      modifiedAtVersions: [
        {
          objectId: '0x00f72ce3a935776b4acadb9b21520ab2812573f886ad8f6c40928399ccc7f69c',
          sequenceNumber: '5622396'
        },
        {
          objectId: '0x33dad3c4a8ec662326d69d94151ab157e26e621830cce125e97965a0111c37c4',
          sequenceNumber: '5682441'
        },
        {
          objectId: '0xa1caa2d708243afccb05cbb64c51aaa66fb2457eb3f87053460cf8aca19a4ae9',
          sequenceNumber: '5682426'
        },
        {
          objectId: '0x06879f269d1cc197d6c3ce689e2c86d5e2406c366faea2d34e2f8ef9232556a3',
          sequenceNumber: '478411'
        },
        {
          objectId: '0x0ebab4cee5c86b4337065558198c2f6dde892e0bd52bbba27f6d2e553c5bb7c6',
          sequenceNumber: '5622396'
        },
        {
          objectId: '0x22698b62ff6c28259b51c4802c935b224657661610c31acc1bb45d52499e24c2',
          sequenceNumber: '469083'
        },
        {
          objectId: '0x4d938debc8b4fb532c9f7c1d34301c326781c6c1c303303d252e9f57472d2b18',
          sequenceNumber: '594975'
        },
        {
          objectId: '0x5a525fb00a5b84d631982eb671f7381b630e4431440811cc06b0df6efc2f47a9',
          sequenceNumber: '849251'
        },
        {
          objectId: '0x5bea010274fe0bbee4d316eb005638f7d5381ce4fb08e507ba2e5fe5eedb4e0e',
          sequenceNumber: '485289'
        },
        {
          objectId: '0xbaa09a53c3a459d39a2356bf4f26f5777b9141290aafece4a733c0fe2a093587',
          sequenceNumber: '400971'
        },
        {
          objectId: '0xc7b574bc35d02a7b9de9d15e0b3afd75c2868272c9440bddd444f42e2ba3c575',
          sequenceNumber: '488872'
        }
      ],
      sharedObjects: [
        {
          objectId: '0x33dad3c4a8ec662326d69d94151ab157e26e621830cce125e97965a0111c37c4',
          version: 5682441,
          digest: 'CBwaxbXh5UPPhrC5si2DEDEx6SeKHfC6kquStAqJw7bU'
        }
      ],
      transactionDigest: '7ur5hCsSxn5TmG92JDfeBKenjLh5xJPqs8XdJBSnnzqm',
      created: [
        {
          owner: {
            AddressOwner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
          },
          reference: {
            objectId: '0x1ea2d831f6c27e01c68b591ba1e0b7271fa689ddb917b75c0a05725c02816718',
            version: 5682442,
            digest: '2aU1Da6VEEeqzS3YasDf9CTf1WYega9H9bNtZ5gjPief'
          }
        },
        {
          owner: {
            AddressOwner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
          },
          reference: {
            objectId: '0xa01239991f259c46a4e2c592a9202d96437e878aa2a72944d6e2335499c13b3a',
            version: 5682442,
            digest: 'GXhJWF76hDghLxdeK17P94FDXBer7n5vgTRX9oQtWTQ1'
          }
        }
      ],
      mutated: [
        {
          owner: {
            AddressOwner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
          },
          reference: {
            objectId: '0x00f72ce3a935776b4acadb9b21520ab2812573f886ad8f6c40928399ccc7f69c',
            version: 5682442,
            digest: '6Wz6rYGLJM9HuB9zLBhxTQTHrcsUwJjdRc3eLWey5jgb'
          }
        },
        {
          owner: {
            Shared: {
              initial_shared_version: 1656
            }
          },
          reference: {
            objectId: '0x33dad3c4a8ec662326d69d94151ab157e26e621830cce125e97965a0111c37c4',
            version: 5682442,
            digest: '6jTBss6yxAhY7yNQnvfTZdVTRTnX5xjgpag7LPoz98ha'
          }
        },
        {
          owner: {
            ObjectOwner: '0xe9ea328f9a1bc60c95420a425262644862e0c42e6a395b809eb7891e266afb4f'
          },
          reference: {
            objectId: '0xa1caa2d708243afccb05cbb64c51aaa66fb2457eb3f87053460cf8aca19a4ae9',
            version: 5682442,
            digest: '8rikprwKQfaevLrnYJqrRZcz8p4UKTUnbVVPGcF28hY1'
          }
        }
      ],
      deleted: [
        {
          objectId: '0x06879f269d1cc197d6c3ce689e2c86d5e2406c366faea2d34e2f8ef9232556a3',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0x0ebab4cee5c86b4337065558198c2f6dde892e0bd52bbba27f6d2e553c5bb7c6',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0x22698b62ff6c28259b51c4802c935b224657661610c31acc1bb45d52499e24c2',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0x4d938debc8b4fb532c9f7c1d34301c326781c6c1c303303d252e9f57472d2b18',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0x5a525fb00a5b84d631982eb671f7381b630e4431440811cc06b0df6efc2f47a9',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0x5bea010274fe0bbee4d316eb005638f7d5381ce4fb08e507ba2e5fe5eedb4e0e',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0xbaa09a53c3a459d39a2356bf4f26f5777b9141290aafece4a733c0fe2a093587',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        },
        {
          objectId: '0xc7b574bc35d02a7b9de9d15e0b3afd75c2868272c9440bddd444f42e2ba3c575',
          version: 5682442,
          digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
        }
      ],
      gasObject: {
        owner: {
          AddressOwner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
        },
        reference: {
          objectId: '0x00f72ce3a935776b4acadb9b21520ab2812573f886ad8f6c40928399ccc7f69c',
          version: 5682442,
          digest: '6Wz6rYGLJM9HuB9zLBhxTQTHrcsUwJjdRc3eLWey5jgb'
        }
      },
      eventsDigest: 'DdWAPNvHSA1wtoPGazo8Z5X7ZWtGdS6dgoufDhL1JgLP',
      dependencies: [
        '6N8ubGs6stwgjMXyDM8LGK5761mYArQkVsvqbemcR2m',
        'WrxJvuMRQJBLvZLGG6JBAUhwXFzxcfUTRbxKtDDbm9p',
        'nEGs2kmuZaudeRgQC3koi2BLwrUcCUZq3NsPKZjQMLE',
        '2N8N9eUiNJTdSGVnP7pppZTrX5EpMc6ogTYNp92EkxZC',
        '5HBKQhxUnxEw6siqkEUwyafsmxPezSAAFGDLzoYhVFsx',
        '5zsnzSDMAr8QuVERChtMVmj2YvaNgbQS5tA3ctPHvYwG',
        '9LVjBF4vvBwyNkmYx8YPB5XPC8hSwwYxLh1Ggwb6mhRz',
        '9fktUxKhQhkUgKWnV7FEtFNMSwbNDbmPxRGSqpzL2GVJ',
        '9zQGptXsKJV7sCTV3a2GbxyEm7QuZej8CbJ84uPH3diZ',
        'BGJTdfBJZGicDLg4mZR4HMCv863eJVxWznqZgyaDamKV',
        'Dn6UmGLf8kSm7oiaZDNuGnq1G7i2NyvQTkYyEpPqK49d',
        'HoAaH5VtiFZXLpXAG7zZfDn27JVSdu7HAQTy7PR48jmt'
      ]
    },
    events: [
      {
        id: {
          txDigest: '7ur5hCsSxn5TmG92JDfeBKenjLh5xJPqs8XdJBSnnzqm',
          eventSeq: '0'
        },
        packageId: '0x6c4a21e3e7e6b6d51c4604021633e1d97e24e37a696f8c082cd48f37503e602a',
        transactionModule: 'router',
        sender: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b',
        type: '0x6c4a21e3e7e6b6d51c4604021633e1d97e24e37a696f8c082cd48f37503e602a::pool::TokenSwapped<0x2::sui::SUI, 0x700de8dea1aac1de7531e9d20fc2568b12d74369f91b7fad3abc1c4f40396e52::bnb::BNB>',
        parsedJson: {
          first_amount_in: '990000000',
          first_amount_out: '0',
          first_reserve: '10586414486938',
          second_amount_in: '0',
          second_amount_out: '3162552',
          second_reserve: '33916858807',
          user: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
        },
        bcs: '2J9LR4U5uFDwEmcCxdF48tZxDnWu4Uh2gbjpMw2N43JRvNJhKmHPhwFhXBLi6agF7oR512TcMxabdhoiqG3BNfGSYnBqXn896AMAbzSXq7BHfu'
      }
    ],
    balanceChanges: [
      {
        owner: {
          AddressOwner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
        },
        coinType: '0x2::sui::SUI',
        amount: '-985520704'
      },
      {
        owner: {
          AddressOwner: '0x76e4c5c9bbe09d271f305f843db9184eef9948e0002d0e8cbe76faac64f0dc6b'
        },
        coinType: '0x700de8dea1aac1de7531e9d20fc2568b12d74369f91b7fad3abc1c4f40396e52::bnb::BNB',
        amount: '3162552'
      }
    ],
    timestampMs: '1687238430646',
    checkpoint: '3309357'
  },
  id: 1
}
