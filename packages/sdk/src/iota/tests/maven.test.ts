import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { TestProcessorServer } from '../../testing/index.js'
import { maven } from './types/0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9.js'
import { IotaContext } from '../context.js'

describe('Test maven', () => {
  const service = new TestProcessorServer(async () => {
    maven.bind().onEntryExecuteCoinOperation(async (call: maven.ExecuteCoinOperationPayload, ctx: IotaContext) => {
      const sender = ctx.transaction.transaction?.data.sender
      const mavenId = call.arguments_decoded[1]
      const type = call.type_arguments[0]
      ctx.eventLogger.emit('maven', { sender, mavenId, type })
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
    const res = await service.iota.testEntryFunctionCall(mavenTestData as any)
    expect(res.result?.counters).length(0)
    expect(res.result?.events).length(1)
  })
})

const mavenTestData = {
  rawTransaction:
    'AQAAAAAAAwEBinG4U0Ma85Z+N8DKfOUzi/p55fjXoTc+7o+eXQ8LV3FSAAAAAAAAAAABAUfvTa6ka/lkdbIJ6l5TN3YygZsRnq+Y63iG3kDegY7cbKocAAAAAAABAAgBAAAAAAAAAAIArl58gytKl/JHP8+A/fLn73K7nSNVK9BdfdjUKNu4ebkFbWF2ZW4Mdm90ZV9hcHByb3ZlAAMBAAABAQABAgAArl58gytKl/JHP8+A/fLn73K7nSNVK9BdfdjUKNu4ebkFbWF2ZW4WZXhlY3V0ZV9jb2luX29wZXJhdGlvbgEHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDc3VpA1NVSQACAQAAAQEAuEvDfNQjgacRaYJpk7NFtMP4tbnaH/6vlA7fSPzJ068B6Z+9UjLS42pypQu+YjP0i97ZaSlPjNAU0HgCFY2+muS8vxoAAAAAACBWAC+WmsW9m2FwVYuBlNvDbUlj44BQY7RlVmgrZc9Va7hLw3zUI4GnEWmCaZOzRbTD+LW52h/+r5QO30j8ydOv4wMAAAAAAACwZWUCAAAAAAABYQAS0FQ/+9q89hMqqfoKzR1jYgzWrZFVjLf5bKL/HwoCYwPLb2jMKevZByoY4sR7DM/09Yc98VwCnsPQXRqXRJQGZyn1WqotCGZ5YRGK2f7koTe2VhZeOTVsOAXPZ6PrRWQ=',
  balanceChanges: [
    {
      owner: { AddressOwner: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af' },
      coinType: '0x2::sui::SUI',
      amount: '-17805896'
    },
    {
      amount: '1000000000',
      owner: { AddressOwner: '0xfd4a47836383301331181afc475b23add822f928a96392ee697b8a55d9d063a5' },
      coinType: '0x2::sui::SUI'
    },
    {
      owner: { ObjectOwner: '0x8c3117f4714e41b455dbd859b4bf9765d2ab2f3470cfb8ca1a05bc9d933bb74a' },
      coinType: '0x2::sui::SUI',
      amount: '-1000000000'
    }
  ],
  transaction: {
    data: {
      gasData: {
        payment: [
          {
            objectId: '0xe99fbd5232d2e36a72a50bbe6233f48bded969294f8cd014d07802158dbe9ae4',
            version: '1753020',
            digest: '6niE8eXSe2zUSRXqgxd3WjRxkzRuPRP4LgiUuaVX46WE'
          }
        ],
        owner: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af',
        price: '995',
        budget: '40199600'
      },
      messageVersion: 'v1',
      transaction: {
        kind: 'ProgrammableTransaction',
        inputs: [
          {
            type: 'object',
            objectType: 'sharedObject',
            objectId: '0x8a71b853431af3967e37c0ca7ce5338bfa79e5f8d7a1373eee8f9e5d0f0b5771',
            initialSharedVersion: '82',
            mutable: false
          },
          {
            type: 'object',
            objectType: 'sharedObject',
            objectId: '0x47ef4daea46bf96475b209ea5e53377632819b119eaf98eb7886de40de818edc',
            initialSharedVersion: '1878636',
            mutable: true
          },
          { type: 'pure', valueType: 'u64', value: '1' }
        ],
        transactions: [
          {
            MoveCall: {
              package: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9',
              module: 'maven',
              function: 'vote_approve',
              arguments: [{ Input: 0 }, { Input: 1 }, { Input: 2 }]
            }
          },
          {
            MoveCall: {
              arguments: [{ Input: 0 }, { Input: 1 }],
              package: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9',
              module: 'maven',
              function: 'execute_coin_operation',
              type_arguments: ['0x2::sui::SUI']
            }
          }
        ]
      },
      sender: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af'
    },
    txSignatures: [
      'ABLQVD/72rz2Eyqp+grNHWNiDNatkVWMt/lsov8fCgJjA8tvaMwp69kHKhjixHsMz/T1hz3xXAKew9BdGpdElAZnKfVaqi0IZnlhEYrZ/uShN7ZWFl45NWw4Bc9no+tFZA=='
    ]
  },
  effects: {
    modifiedAtVersions: [
      { sequenceNumber: '1878638', objectId: '0x47ef4daea46bf96475b209ea5e53377632819b119eaf98eb7886de40de818edc' },
      { sequenceNumber: '1878637', objectId: '0xca70a110459afeb50c12fa360c656b0c67004c7a88163aa5c23ad1b947a2876b' },
      { objectId: '0xe99fbd5232d2e36a72a50bbe6233f48bded969294f8cd014d07802158dbe9ae4', sequenceNumber: '1753020' },
      { objectId: '0x8b1ca9454c46a53110df8d2594c7bf7a2d8af85051632fa95a0556e219e1698d', sequenceNumber: '1878638' }
    ],
    sharedObjects: [
      {
        digest: 'CqXiUxbZdEV44FJMk8n8CeJWoepae8YpjhLFrLMuFdE6',
        objectId: '0x8a71b853431af3967e37c0ca7ce5338bfa79e5f8d7a1373eee8f9e5d0f0b5771',
        version: '82'
      },
      {
        objectId: '0x47ef4daea46bf96475b209ea5e53377632819b119eaf98eb7886de40de818edc',
        version: '1878638',
        digest: 'Ck9js1kc9qTHZPZjxgf6y9sAThCRFkW3aTBeMcxZWgPG'
      }
    ],
    created: [
      {
        owner: { AddressOwner: '0xfd4a47836383301331181afc475b23add822f928a96392ee697b8a55d9d063a5' },
        reference: {
          objectId: '0x9eed6db2887b3f95c16fe68cbc58e2f114c30bd1ba898326f52975ab68186b31',
          version: '1878639',
          digest: '4cXzK1UTqV2aSsMYekrPGnTqp2VLqFe34Y8LDs4xvXaZ'
        }
      }
    ],
    deleted: [
      {
        version: '1878639',
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz',
        objectId: '0x8b1ca9454c46a53110df8d2594c7bf7a2d8af85051632fa95a0556e219e1698d'
      }
    ],
    messageVersion: 'v1',
    status: { status: 'success' },
    transactionDigest: '4Bj726jrih5K3ZmKfXc27fZUupSnH1R8riNCWXgA7iCg',
    mutated: [
      {
        owner: { Shared: { initial_shared_version: '1878636' } },
        reference: {
          version: '1878639',
          digest: '8i41JHHrwbTDhFC5vcAjxQAwDmMppapCBeBvFMNKT9kx',
          objectId: '0x47ef4daea46bf96475b209ea5e53377632819b119eaf98eb7886de40de818edc'
        }
      },
      {
        owner: { ObjectOwner: '0x8c3117f4714e41b455dbd859b4bf9765d2ab2f3470cfb8ca1a05bc9d933bb74a' },
        reference: {
          digest: 'EbKVxGLVLxU4ThPdxpfQPbsEXoZTGfGb62jhXbTFUYs6',
          objectId: '0xca70a110459afeb50c12fa360c656b0c67004c7a88163aa5c23ad1b947a2876b',
          version: '1878639'
        }
      },
      {
        owner: { AddressOwner: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af' },
        reference: {
          objectId: '0xe99fbd5232d2e36a72a50bbe6233f48bded969294f8cd014d07802158dbe9ae4',
          version: '1878639',
          digest: '7iDavCa4WDh6fy7pu2yRo7rFmGhFE1259EjM7Q1m4Axk'
        }
      }
    ],
    gasObject: {
      reference: {
        objectId: '0xe99fbd5232d2e36a72a50bbe6233f48bded969294f8cd014d07802158dbe9ae4',
        version: '1878639',
        digest: '7iDavCa4WDh6fy7pu2yRo7rFmGhFE1259EjM7Q1m4Axk'
      },
      owner: { AddressOwner: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af' }
    },
    eventsDigest: '8fEZMw2DTAmfhm68ZaMV7G9vq3h6q22nT2bK52ZBFo8D',
    dependencies: [
      'nqQTvyaFYcPABdWMvhhHNKnzshhWCYUnLxrPDkQEvuN',
      'CUASX9wTz4BdSpeSY9pqjKeDcnMTZ23Smdb3KthNhYQP',
      'GYwXHdGyvoQfiU6eq6iSvNZR6YHCUnSLuAoiatRQZNrG',
      'HzRTGc8KzEGSjm7TAVb2DWe2eT5ZHcdFSjW1jWNxhBRr'
    ],
    executedEpoch: '24',
    gasUsed: {
      computationCost: '19900000',
      storageCost: '9538000',
      storageRebate: '11632104',
      nonRefundableStorageFee: '117496'
    }
  },
  events: [
    {
      transactionModule: 'maven',
      sender: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af',
      type: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9::maven::VoteProposalEvent',
      parsedJson: {
        maven: '0x47ef4daea46bf96475b209ea5e53377632819b119eaf98eb7886de40de818edc',
        sn: '1',
        voter: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af',
        approve: true
      },
      bcs: '5gpFsrzviyHdmxyokCaNKxM5hHn39UgfsSQ9mJYxEnZGXxt2sn4S9GTbjzw2aBkhEupjDeQcGhZS9ZciFKxgngUjmCB4d2x7bpPS',
      id: { txDigest: '4Bj726jrih5K3ZmKfXc27fZUupSnH1R8riNCWXgA7iCg', eventSeq: '0' },
      packageId: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9'
    },
    {
      sender: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af',
      type: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9::vault::TransferCoinEvent<0x2::coin::Coin<0x2::sui::SUI>>',
      parsedJson: {
        asset_key: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
        to: '0xfd4a47836383301331181afc475b23add822f928a96392ee697b8a55d9d063a5',
        vault: '0x0e1b79607e4e86722a1b73d29caab209f101b7fbbd7c0e484e05151020af0f46',
        amount: '1000000000'
      },
      bcs: '2Af54gtStvNdpmCX7tBs1WpKSR6pBp2jz1qosfiMNwDepwcxpAkZakFk7fdeDqtysnoHCQsLeLgWJbF2Ca6tkpVxJ8DNQzAob4SPn8dgWnQVSujxjgD8g1hR2E9P1q7aTRHWFFdFRKeJAsaq8srbe2kkZehozwq1uArmCTQuKnkzT2idNcxx8Bm5aidzBDvcGXKBZ6gTR',
      id: { txDigest: '4Bj726jrih5K3ZmKfXc27fZUupSnH1R8riNCWXgA7iCg', eventSeq: '1' },
      packageId: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9',
      transactionModule: 'maven'
    },
    {
      id: { txDigest: '4Bj726jrih5K3ZmKfXc27fZUupSnH1R8riNCWXgA7iCg', eventSeq: '2' },
      packageId: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9',
      transactionModule: 'maven',
      sender: '0xb84bc37cd42381a71169826993b345b4c3f8b5b9da1ffeaf940edf48fcc9d3af',
      type: '0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9::maven::ExecuteProposalEvent',
      parsedJson: {
        sn: '1',
        success: true,
        error_codes: ['0'],
        maven: '0x47ef4daea46bf96475b209ea5e53377632819b119eaf98eb7886de40de818edc'
      },
      bcs: 'tQbuPvwoHiziEYrSnoaWPfoWdE2cB8bcz6xgviHDviPD7gC7sBzFH14G3tQ8d459beto'
    }
  ],
  timestampMs: '1683439168859',
  checkpoint: '1878849',
  checkpoint_timestamp_ms: '1683439168859',
  transaction_position: 1,
  digest: '4Bj726jrih5K3ZmKfXc27fZUupSnH1R8riNCWXgA7iCg'
}
