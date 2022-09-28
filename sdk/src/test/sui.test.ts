import { expect } from 'chai'
import { TextEncoder } from 'util'
import { ProcessTransactionsRequest } from '..'

import { TestProcessorServer } from './test-processor-server'

describe('Test Sui Example', () => {
  const service = new TestProcessorServer(() => {
    require('./tic-tac-toe')
  })

  beforeAll(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
  })

  test('Check tictactoe transaction dispatch', async () => {
    const request: ProcessTransactionsRequest = {
      chainId: 'SUI_devnet',
      transactions: [
        {
          // txHash: 'z3HjnnFFKAaszOi0pMSImtGMpRd2r7ljLjAjUoqs3Kw=',
          raw: new TextEncoder().encode(JSON.stringify(testData)),
          programAccountId: '0xb8252513f0b9efaa3e260842c4b84d8ff933522d',
        },
      ],
    }
    const res = await service.processTransactions(request)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
  })
})

const testData = {
  certificate: {
    transactionDigest: 'z3HjnnFFKAaszOi0pMSImtGMpRd2r7ljLjAjUoqs3Kw=',
    data: {
      transactions: [
        {
          Call: {
            package: {
              objectId: '0xb8252513f0b9efaa3e260842c4b84d8ff933522d',
              version: 1,
              digest: 'UyeEXDb5jCLGuk/PVcqdLtbKSI3mSANB2/DxiyzXRC8=',
            },
            module: 'shared_tic_tac_toe',
            function: 'place_mark',
            arguments: ['0x8ed24078d64aa1a2a7593cba7ab64eb2016fa3d4', 2, ''],
          },
        },
      ],
      sender: '0x1c270459011d19dc342751aff75b4188334438fa',
      gasPayment: {
        objectId: '0x018b73e6652bab0f6419fa998263b568fa0688bb',
        version: 8,
        digest: 'suj5fniFCh3oqu+3BQWASz5zyUl4jUWVmJFf76AwVoE=',
      },
      gasBudget: 1000,
    },
    txSignature:
      'ACIBv8kDff83DOjZsrUe4RqC1BLBGZtLAwFf/3tHUWJe1F+fxtg16Kqdm85TY9IWeYhVTtQkmchROxX8g0pi/Ak48WB/fgCTwX6K9CIMWgmr+j4k7x4dPYBNizpjHvBgCQ==',
    authSignInfo: {
      epoch: 0,
      signature: [
        'o4tOmjc4jJ27NoKGEHlNDZav0rBJLDqzzsL1kGJOviPKgpLlxyFCeBHrgjAwoc4Y5M75wYgccCuiv67l1w05DQ==',
        'B2tClnK9GYCDFg6HbO/IW7hlJkhfIXi6NoDn7s4Pyw94BjMB/v0S0ZufbLwDO/WhBwU83q+wRTanG4HRhvUuBw==',
        '5s49bESgHvDH7/oqjuxjy9YW4xWCG4e8g6hGlZC0bTXskPdf+q6bSGglkkMpOr1B3uIlMeif1NAlRQCKsfNcCg==',
      ],
      signers_map: [58, 48, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 16, 0, 0, 0, 1, 0, 2, 0, 3, 0],
    },
  },
  effects: {
    status: {
      status: 'success',
    },
    gasUsed: {
      computationCost: 716,
      storageCost: 48,
      storageRebate: 35,
    },
    sharedObjects: [
      {
        objectId: '0x8ed24078d64aa1a2a7593cba7ab64eb2016fa3d4',
        version: 6,
        digest: 'kY/I9fcr6rL2EbDO88MxrEmEaxAEtRxgd+lcfQnE4ww=',
      },
    ],
    transactionDigest: 'z3HjnnFFKAaszOi0pMSImtGMpRd2r7ljLjAjUoqs3Kw=',
    created: [
      {
        owner: {
          AddressOwner: '0x1c270459011d19dc342751aff75b4188334438fa',
        },
        reference: {
          objectId: '0x2e37e03297a9d138687ffd921f8a830a6f498ec6',
          version: 1,
          digest: '1zZhoVoTLPRM1YpGX9EcrwPJulKcXyLrF+40rTIQ06g=',
        },
      },
    ],
    mutated: [
      {
        owner: {
          AddressOwner: '0x1c270459011d19dc342751aff75b4188334438fa',
        },
        reference: {
          objectId: '0x018b73e6652bab0f6419fa998263b568fa0688bb',
          version: 9,
          digest: 'naHwWYK8vl7UBnhp40o7h7JI+cxvFF8rTIOQ4RJ4vus=',
        },
      },
      {
        owner: 'Shared',
        reference: {
          objectId: '0x8ed24078d64aa1a2a7593cba7ab64eb2016fa3d4',
          version: 7,
          digest: 's3R+lWAMGde7eqZzllafAJkoR7Em55An8gHgz7oCImw=',
        },
      },
    ],
    gasObject: {
      owner: {
        AddressOwner: '0x1c270459011d19dc342751aff75b4188334438fa',
      },
      reference: {
        objectId: '0x018b73e6652bab0f6419fa998263b568fa0688bb',
        version: 9,
        digest: 'naHwWYK8vl7UBnhp40o7h7JI+cxvFF8rTIOQ4RJ4vus=',
      },
    },
    events: [
      {
        moveEvent: {
          packageId: '0xb8252513f0b9efaa3e260842c4b84d8ff933522d',
          transactionModule: 'shared_tic_tac_toe',
          sender: '0x1c270459011d19dc342751aff75b4188334438fa',
          type: '0xb8252513f0b9efaa3e260842c4b84d8ff933522d::shared_tic_tac_toe::GameEndEvent',
          fields: {
            game_id: '0x8ed24078d64aa1a2a7593cba7ab64eb2016fa3d4',
          },
          bcs: 'jtJAeNZKoaKnWTy6erZOsgFvo9Q=',
        },
      },
      {
        newObject: {
          packageId: '0xb8252513f0b9efaa3e260842c4b84d8ff933522d',
          transactionModule: 'shared_tic_tac_toe',
          sender: '0x1c270459011d19dc342751aff75b4188334438fa',
          recipient: {
            AddressOwner: '0x1c270459011d19dc342751aff75b4188334438fa',
          },
          objectId: '0x2e37e03297a9d138687ffd921f8a830a6f498ec6',
        },
      },
    ],
    dependencies: [
      'UgLnWz4u9GTgAJYwR+rz+YO5TDJiZHuFjzyh9blJO2o=',
      'lw2dyQ9J3fPeH5Lx5aiHfjxDHJENTH4910r2/Y/PQX4=',
      'phojYeMd7C6mRxGXQFDPF10NFYMEUfBND+f8wJGKkbg=',
    ],
  },
  timestamp_ms: 1662996912461,
  parsed_data: null,
}
