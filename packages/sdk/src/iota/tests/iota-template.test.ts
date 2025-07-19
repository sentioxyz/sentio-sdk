import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { TestProcessorServer } from '../../testing/index.js'
import { IotaNetwork } from '../network.js'
import { iota_system, validator } from '../builtin/0x3.js'
import { IotaObjectProcessorTemplate } from '../iota-object-processor-template.js'

describe('Test Iota Template Example', () => {
  let round = 0
  const service = new TestProcessorServer(async () => {
    const template = new IotaObjectProcessorTemplate().onTimeInterval(() => {})

    validator.bind({ network: IotaNetwork.TEST_NET }).onEventStakingRequestEvent((evt, ctx) => {
      template.bind({ objectId: '0x56a' + round }, ctx)
    })

    iota_system.bind({ network: IotaNetwork.TEST_NET }).onEntryRequestAddStake((call, ctx) => {
      template.unbind({ objectId: '0x56a' + round }, ctx)
    })
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(0)
    expect(config.templateInstances).length(0)
  })

  test('Check template changes', async () => {
    // single round test
    let res = await service.iota.testEvent(testData as any, IotaNetwork.TEST_NET)
    let config = await service.getConfig({})
    expect(res.result?.states?.configUpdated).equals(true)
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(1)
    expect(config.templateInstances).length(1)

    res = await service.iota.testEntryFunctionCall(testData as any, IotaNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(res.result?.states?.configUpdated).equals(true)
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(0)
    expect(config.templateInstances).length(0)

    // multi round test
    await service.iota.testEvent(testData as any, IotaNetwork.TEST_NET)

    round = 1
    await service.iota.testEvent(testData as any, IotaNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(2)
    expect(config.templateInstances).length(2)
    expect(config.accountConfigs[0].moveIntervalConfigs[0].intervalConfig?.handlerId).equals(72000003)
    expect(config.accountConfigs[1].moveIntervalConfigs[0].intervalConfig?.handlerId).equals(72000004)

    round = 0
    res = await service.iota.testEntryFunctionCall(testData as any, IotaNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(1)
    expect(config.templateInstances).length(1)
    expect(config.accountConfigs[0].moveIntervalConfigs[0].intervalConfig?.handlerId).equals(72000003)

    round = 1
    res = await service.iota.testEntryFunctionCall(testData as any, IotaNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(0)
    expect(config.templateInstances).length(0)

    // make sure extra unbind won't crash server
    round = 1
    await service.iota.testEntryFunctionCall(testData as any, IotaNetwork.TEST_NET)
    round = 0
    await service.iota.testEntryFunctionCall(testData as any, IotaNetwork.TEST_NET)
  })
})

const testData = {
  digest: '1Jo5RUSfLknKiGkZUxVxkWhTbX7CD3Jm3fQzaCEV3JM',
  transaction: {
    data: {
      messageVersion: 'v1',
      transaction: {
        kind: 'ProgrammableTransaction',
        inputs: [
          {
            type: 'pure',
            valueType: 'u64',
            value: '1013400000'
          },
          {
            type: 'object',
            objectType: 'sharedObject',
            objectId: '0x0000000000000000000000000000000000000000000000000000000000000005',
            initialSharedVersion: '1',
            mutable: true
          },
          {
            type: 'pure',
            valueType: 'address',
            value: '0x6daaa84982e84af05db193f48afd979990af2d2a7aa65b398c398db9a79b603f'
          }
        ],
        transactions: [
          {
            SplitCoins: [
              'GasCoin',
              [
                {
                  Input: 0
                }
              ]
            ]
          },
          {
            MoveCall: {
              package: '0x0000000000000000000000000000000000000000000000000000000000000003',
              module: 'iota_system',
              function: 'request_add_stake',
              arguments: [
                {
                  Input: 1
                },
                {
                  Result: 0
                },
                {
                  Input: 2
                }
              ]
            }
          }
        ]
      },
      sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
      gasData: {
        payment: [
          {
            objectId: '0x06549c4fa56f5c55b45f2bb6d5e41c9ffe93322c9c0cf8a6fa332e03d57cd818',
            version: 248215,
            digest: '457NDp7i5cFVf4uq6XFpG8g5QgcbsM3mHZ5eaJJwCMcM'
          },
          {
            objectId: '0x09aa7eb7348209863a467ec19ba43f06b009d79d1b3bbcedc45804bf99d83eac',
            version: 248215,
            digest: '3QYAYsWqEKiJe6znxfPBmiGdqz9q9Tb6tvZsq1rs9YMk'
          },
          {
            objectId: '0x784d237927050a245a9ba5e0354ec8fea5b69bfaf37aaada70f8acc5b72e7e44',
            version: 10210,
            digest: 'FjHUKzJ8g66cc9jy3aRU6ruPshYah3NL8SzPoou6L2v3'
          },
          {
            objectId: '0x7bca72a25735ab5becda8537878cc13cb811879adaef531d23bcc6edc92d2d6c',
            version: 10210,
            digest: '4pMGJznp7gWQHJEajafjjmXQHRr6zNSBBFsWJjYPeeDj'
          },
          {
            objectId: '0x9319084a620be0e87b3b17f4ae26dfb51fdbfa2d7bb439e7dfc046a1de091ec8',
            version: 10210,
            digest: '9awSRVSdPKLw7D4gyuq4MoAGxPJsggTVwMLGF15w12z7'
          },
          {
            objectId: '0xa20665dfd4d6a527c0d4a502f1523014d10494deb4c4ff46becf606cbbb437a1',
            version: 10210,
            digest: 'EXC5JUtiKHayta6dP9UyvR3ZequEmzULMJUvVWnLkRVf'
          },
          {
            objectId: '0xacb23c3e52f27eddd94bc78b45028ee40ed1cc3da6445a7c24c20e68593e6d5a',
            version: 10400,
            digest: 'HbS7pRsL5fxrWvrRTzGYzDw9vv6vGWS51qyDn52whptA'
          },
          {
            objectId: '0xb0ed1bac02fa29a039b9951fedab90938fc2b2f4798bcebf731f909d36522736',
            version: 10400,
            digest: 'F4DZCuVpU5NZ4LfvSrKg6zoudJPZvAwUi4rRyU2VFJfg'
          },
          {
            objectId: '0xbc9e291e42202c0e74eeefa9a6f391735fc92d9e350be7d8553f1c1e0c7b0d61',
            version: 10210,
            digest: 'GerpPcqdHjMXDo2pBbh7bEXiL1MSEJYfcQ4tG71sp2B7'
          },
          {
            objectId: '0xc1249d21c5cd64069fcee8f27cebb7a0dfce5494fb266c5e941ea5791118f4cc',
            version: 10210,
            digest: 'BmV26Z1K8QLqGKsAHYy92T58h2t9eT5h5cfZrwFiZyfY'
          },
          {
            objectId: '0xc7658384ee1298bb43107794ccae10d7a13dc6544043299affea621116170bcd',
            version: 10210,
            digest: '1PC3n5KNxScBB6QbhVMKoGJocHxzxQZaeDYrb5JCCw4'
          },
          {
            objectId: '0xdde6e8a18c4717054b9abef47f0b3b4fa8c3c9d670bf59fd3b11ac6478d17668',
            version: 10400,
            digest: 'G5tZLDPZ2MXDnsi1zn1HfGUXG524XxNLNontmv5cTZgg'
          },
          {
            objectId: '0xe1f247f4edf3326161f74115470afe5c51c8700843ae594dfa4e82780a6fdc3b',
            version: 10400,
            digest: 'GpmL8i5yFTA5QrtF3pf1LjgFybfCUddPVASySfmrhrHc'
          },
          {
            objectId: '0xe5181942681d8b49afbb4d70804148e2a6a837b6887ba8967d6254b71d3195e0',
            version: 10210,
            digest: 'GBeGY8DYitfyC2RaaRpxGYteB4tBPMfBaipKok8Kyz17'
          },
          {
            objectId: '0xee94d0332dfe9cbf7cbc25bdc2a21e2ed3fc48d18edab2b2121cb6a2f3a7c358',
            version: 10210,
            digest: 'DozeCXEGmPeQB8EnFxyJkA8nC98CqvynpZX5ENT9ebgN'
          },
          {
            objectId: '0xf14c33c7419ccf21b75d82c78350e41b4096e411d8f2cbf00fa01f0ab9b21c63',
            version: 10400,
            digest: '58Xvu2GtxJR6unXpFyWchayEoovUGJT24aisD4oUsUrm'
          },
          {
            objectId: '0xf673811fe05efd3b9c40f8dac6f44a6af080377d0149c6e5304167fab84ba579',
            version: 10210,
            digest: 'GAcbDUHzBaPEov5p9D754FiBjK76EDcuheMrEL9kx8Hh'
          }
        ],
        owner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
        price: '1000',
        budget: '10227000'
      }
    },
    txSignatures: [
      'AEPwkUYAr4jL78Qi2Fk4/W/q1841F6sdYEUXlMNj5zK8Q5EgzHGDipN+ceKkQPiJfF0gCwxIe4BUaiUdnGJI8gJznTI5itVTVu6dyxa9sXlAWOsNzUcBHLI6C98q41Yw0w=='
    ]
  },
  rawTransaction:
    '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',
  effects: {
    messageVersion: 'v1',
    status: {
      status: 'success'
    },
    executedEpoch: '744',
    gasUsed: {
      computationCost: '1000000',
      storageCost: '9057',
      storageRebate: '9248',
      nonRefundableStorageFee: '0'
    },
    modifiedAtVersions: [
      {
        objectId: '0x0000000000000000000000000000000000000000000000000000000000000005',
        sequenceNumber: '280243'
      },
      {
        objectId: '0x06549c4fa56f5c55b45f2bb6d5e41c9ffe93322c9c0cf8a6fa332e03d57cd818',
        sequenceNumber: '248215'
      },
      {
        objectId: '0x6af2a2b7ca60bf76174adfd3e9c4957f8e937759603182f9b46c7f6c5f19c6d2',
        sequenceNumber: '280243'
      },
      {
        objectId: '0x09aa7eb7348209863a467ec19ba43f06b009d79d1b3bbcedc45804bf99d83eac',
        sequenceNumber: '248215'
      },
      {
        objectId: '0x784d237927050a245a9ba5e0354ec8fea5b69bfaf37aaada70f8acc5b72e7e44',
        sequenceNumber: '10210'
      },
      {
        objectId: '0x7bca72a25735ab5becda8537878cc13cb811879adaef531d23bcc6edc92d2d6c',
        sequenceNumber: '10210'
      },
      {
        objectId: '0x9319084a620be0e87b3b17f4ae26dfb51fdbfa2d7bb439e7dfc046a1de091ec8',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xa20665dfd4d6a527c0d4a502f1523014d10494deb4c4ff46becf606cbbb437a1',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xacb23c3e52f27eddd94bc78b45028ee40ed1cc3da6445a7c24c20e68593e6d5a',
        sequenceNumber: '10400'
      },
      {
        objectId: '0xb0ed1bac02fa29a039b9951fedab90938fc2b2f4798bcebf731f909d36522736',
        sequenceNumber: '10400'
      },
      {
        objectId: '0xbc9e291e42202c0e74eeefa9a6f391735fc92d9e350be7d8553f1c1e0c7b0d61',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xc1249d21c5cd64069fcee8f27cebb7a0dfce5494fb266c5e941ea5791118f4cc',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xc7658384ee1298bb43107794ccae10d7a13dc6544043299affea621116170bcd',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xdde6e8a18c4717054b9abef47f0b3b4fa8c3c9d670bf59fd3b11ac6478d17668',
        sequenceNumber: '10400'
      },
      {
        objectId: '0xe1f247f4edf3326161f74115470afe5c51c8700843ae594dfa4e82780a6fdc3b',
        sequenceNumber: '10400'
      },
      {
        objectId: '0xe5181942681d8b49afbb4d70804148e2a6a837b6887ba8967d6254b71d3195e0',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xee94d0332dfe9cbf7cbc25bdc2a21e2ed3fc48d18edab2b2121cb6a2f3a7c358',
        sequenceNumber: '10210'
      },
      {
        objectId: '0xf14c33c7419ccf21b75d82c78350e41b4096e411d8f2cbf00fa01f0ab9b21c63',
        sequenceNumber: '10400'
      },
      {
        objectId: '0xf673811fe05efd3b9c40f8dac6f44a6af080377d0149c6e5304167fab84ba579',
        sequenceNumber: '10210'
      }
    ],
    sharedObjects: [
      {
        objectId: '0x0000000000000000000000000000000000000000000000000000000000000005',
        version: 280243,
        digest: '89PKQ9Rvi1jN3Qx8dwLY4NLHWcBhZ5tJfu6fKEdUP5N2'
      }
    ],
    transactionDigest: '1Jo5RUSfLknKiGkZUxVxkWhTbX7CD3Jm3fQzaCEV3JM',
    created: [
      {
        owner: {
          AddressOwner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8'
        },
        reference: {
          objectId: '0x746cb3749d743d9f2f9384df3c6d9076ffa0ed748b4e827508632e167be3973f',
          version: 280244,
          digest: 'AWojdmyZ6dSG56J2zYsyxKGJupR6yFqgNhPsbT2kirZ'
        }
      }
    ],
    mutated: [
      {
        owner: {
          Shared: {
            initial_shared_version: 1
          }
        },
        reference: {
          objectId: '0x0000000000000000000000000000000000000000000000000000000000000005',
          version: 280244,
          digest: '395mZycSW6f4hRQbToe4UuEvc5QHcXJxAiNYPjnf9UD5'
        }
      },
      {
        owner: {
          AddressOwner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8'
        },
        reference: {
          objectId: '0x06549c4fa56f5c55b45f2bb6d5e41c9ffe93322c9c0cf8a6fa332e03d57cd818',
          version: 280244,
          digest: 'EFrBdvNNQyjoXkBRGQnSmj1ELV18a1p7hb4dnuxKWPyY'
        }
      },
      {
        owner: {
          ObjectOwner: '0x0000000000000000000000000000000000000000000000000000000000000005'
        },
        reference: {
          objectId: '0x6af2a2b7ca60bf76174adfd3e9c4957f8e937759603182f9b46c7f6c5f19c6d2',
          version: 280244,
          digest: 'D7UBCDNU5TPXxcQzyVLBU6mdfoafQBFqKsYi4oYXrnvr'
        }
      }
    ],
    deleted: [
      {
        objectId: '0x09aa7eb7348209863a467ec19ba43f06b009d79d1b3bbcedc45804bf99d83eac',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0x784d237927050a245a9ba5e0354ec8fea5b69bfaf37aaada70f8acc5b72e7e44',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0x7bca72a25735ab5becda8537878cc13cb811879adaef531d23bcc6edc92d2d6c',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0x9319084a620be0e87b3b17f4ae26dfb51fdbfa2d7bb439e7dfc046a1de091ec8',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xa20665dfd4d6a527c0d4a502f1523014d10494deb4c4ff46becf606cbbb437a1',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xacb23c3e52f27eddd94bc78b45028ee40ed1cc3da6445a7c24c20e68593e6d5a',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xb0ed1bac02fa29a039b9951fedab90938fc2b2f4798bcebf731f909d36522736',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xbc9e291e42202c0e74eeefa9a6f391735fc92d9e350be7d8553f1c1e0c7b0d61',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xc1249d21c5cd64069fcee8f27cebb7a0dfce5494fb266c5e941ea5791118f4cc',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xc7658384ee1298bb43107794ccae10d7a13dc6544043299affea621116170bcd',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xdde6e8a18c4717054b9abef47f0b3b4fa8c3c9d670bf59fd3b11ac6478d17668',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xe1f247f4edf3326161f74115470afe5c51c8700843ae594dfa4e82780a6fdc3b',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xe5181942681d8b49afbb4d70804148e2a6a837b6887ba8967d6254b71d3195e0',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xee94d0332dfe9cbf7cbc25bdc2a21e2ed3fc48d18edab2b2121cb6a2f3a7c358',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xf14c33c7419ccf21b75d82c78350e41b4096e411d8f2cbf00fa01f0ab9b21c63',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      },
      {
        objectId: '0xf673811fe05efd3b9c40f8dac6f44a6af080377d0149c6e5304167fab84ba579',
        version: 280244,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz'
      }
    ],
    gasObject: {
      owner: {
        AddressOwner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8'
      },
      reference: {
        objectId: '0x06549c4fa56f5c55b45f2bb6d5e41c9ffe93322c9c0cf8a6fa332e03d57cd818',
        version: 280244,
        digest: 'EFrBdvNNQyjoXkBRGQnSmj1ELV18a1p7hb4dnuxKWPyY'
      }
    },
    eventsDigest: '7Qgc6Uhd2hd2P246qU24Qyeva5CGgFvMZ4rv2hB2x34s',
    dependencies: [
      '8CLu2i7jB1GQjt9h6EyPZmrdHeWCHrJYddiT4dTnecH3',
      'AGBCaUGj4iGpGYyQvto9Bke1EwouY8LGMoTzzuPMx4nd',
      'BD5BNdX54tX3Z3oAnzCpCCfsA94FX7bibM8dKSxMGfZm',
      'BcYN71Dg7czVQjUFsVWEqDEHQQvFXBcQAWzAMM27FUNL',
      'H5LafzisLsy3d3tLJNPeA1ZTtwUraHZBzcYKFwCpw81g',
      'HSJTmPHs5K1ffRkR8McjgckD7agweSa5Nws1pCiWRsTZ'
    ]
  },
  events: [
    {
      id: {
        txDigest: '1Jo5RUSfLknKiGkZUxVxkWhTbX7CD3Jm3fQzaCEV3JM',
        eventSeq: '0'
      },
      packageId: '0x0000000000000000000000000000000000000000000000000000000000000003',
      transactionModule: 'iota_system',
      sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
      type: '0x3::validator::StakingRequestEvent',
      parsedJson: {
        amount: '1013400000',
        epoch: '744',
        pool_id: '0x8f3c1872502008904d027ca7d2935434ad1c030174a77eabd8d4e0b6a1b38d77',
        staker_address: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
        validator_address: '0x6daaa84982e84af05db193f48afd979990af2d2a7aa65b398c398db9a79b603f'
      },
      bcs: 'Ttm2PrMwJN6CeVHDa3Zw4ocifhrqbrrCPt12v2fj8cjsQKswxceNqK7oWBnnKUkY8oUvEmuHuJ8srUm28PeFvqz7BrUnTVV1AAxEV2BY24d3JVuxezp4px16vGPrQsPHzaoPoMjkdYtiPLt29Nk4FA6uV'
    }
  ],
  objectChanges: [
    {
      type: 'mutated',
      sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
      owner: {
        Shared: {
          initial_shared_version: 1
        }
      },
      objectType: '0x3::iota_system::IotaSystemState',
      objectId: '0x0000000000000000000000000000000000000000000000000000000000000005',
      version: '280244',
      previousVersion: '280243',
      digest: '395mZycSW6f4hRQbToe4UuEvc5QHcXJxAiNYPjnf9UD5'
    },
    {
      type: 'mutated',
      sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
      owner: {
        AddressOwner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8'
      },
      objectType: '0x2::coin::Coin<0x2::sui::SUI>',
      objectId: '0x06549c4fa56f5c55b45f2bb6d5e41c9ffe93322c9c0cf8a6fa332e03d57cd818',
      version: '280244',
      previousVersion: '248215',
      digest: 'EFrBdvNNQyjoXkBRGQnSmj1ELV18a1p7hb4dnuxKWPyY'
    },
    {
      type: 'mutated',
      sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
      owner: {
        ObjectOwner: '0x0000000000000000000000000000000000000000000000000000000000000005'
      },
      objectType: '0x2::dynamic_field::Field<u64, 0x3::iota_system_state_inner::IotaSystemStateInner>',
      objectId: '0x6af2a2b7ca60bf76174adfd3e9c4957f8e937759603182f9b46c7f6c5f19c6d2',
      version: '280244',
      previousVersion: '280243',
      digest: 'D7UBCDNU5TPXxcQzyVLBU6mdfoafQBFqKsYi4oYXrnvr'
    },
    {
      type: 'created',
      sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
      owner: {
        AddressOwner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8'
      },
      objectType: '0x3::staking_pool::StakedIota',
      objectId: '0x746cb3749d743d9f2f9384df3c6d9076ffa0ed748b4e827508632e167be3973f',
      version: '280244',
      digest: 'AWojdmyZ6dSG56J2zYsyxKGJupR6yFqgNhPsbT2kirZ'
    }
  ],
  balanceChanges: [
    {
      owner: {
        AddressOwner: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8'
      },
      coinType: '0x2::sui::SUI',
      amount: '-1014399901'
    }
  ],
  timestampMs: '1680304142717',
  checkpoint: '233041'
}
