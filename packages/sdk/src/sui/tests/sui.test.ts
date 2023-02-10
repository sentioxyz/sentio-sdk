import { expect } from 'chai'
import { SuiBaseProcessor, SuiBindOptions } from '../index.js'

import { TestProcessorServer } from '@sentio/sdk/testing'
import { DataBinding, HandlerType } from '@sentio/protos'

describe('Test Sui Example', () => {
  const service = new TestProcessorServer(async () => {
    class SwapProcessor extends SuiBaseProcessor {
      static bind(options: SuiBindOptions): SwapProcessor {
        return new SwapProcessor('TicTacToe', options)
      }
    }

    SwapProcessor.bind({
      startTimestamp: 0,
      address: '0x8235459df815e77668b4a49bb36e229f3321f432',
    }).onMoveEvent(
      (evt, ctx) => {
        const amount = parseInt(evt.fields?.x_amount)
        ctx.meter.Counter('amount').add(amount)
      },
      {
        type: 'pool::LiquidityEvent',
      }
    )
  })

  beforeAll(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
  })

  test('Check transaction dispatch', async () => {
    const data = testData
    data.effects.events = [data.effects.events[data.effects.events.length - 1]]
    const request: DataBinding = {
      data: {
        suiEvent: {
          transaction: data,
        },
      },
      handlerIds: [0],
      handlerType: HandlerType.SUI_EVENT,
    }
    const res = await service.processBinding(request)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    // expect(res.result?.counters[0].metadata?.toInt()).equal(12345)
  })
})

const testData = {
  certificate: {
    transactionDigest: '7DSTY6euDQKq7fn3N7654Xf1pbpSuBuYarW2c6B6ixio',
    data: {
      transactions: [
        {
          Call: {
            package: {
              objectId: '0x8235459df815e77668b4a49bb36e229f3321f432',
              version: 1,
              digest: 'THgI2ZcsS4aU5UNvLjB1huyOTXZ+QEavMOWGPC1UnHE=',
            },
            module: 'pool',
            function: 'add_liquidity',
            typeArguments: ['0x8235459df815e77668b4a49bb36e229f3321f432::pool::TestSOL', '0x2::sui::SUI'],
            arguments: [
              '0x481a9c313aa7275e6fc9ff60eba919564b385086',
              '0xc9b60a9fd79a9536f2f49e6827a51e8e62a7a544',
              '0x84210e7d5fb0be0b359ef8cdacb0d0448baf8478',
              [64, 13, 3, 0, 0, 0, 0, 0],
              [16, 0, 0, 0, 0, 0, 0, 0],
            ],
          },
        },
      ],
      sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
      gasPayment: {
        objectId: '0xd5bc168c9cbddf5918818c1d544580e97de3bd46',
        version: 2493759,
        digest: '+AVDN5/rqB755p9bU4Qh0gpn8FlaA6+ZRO//VPUSTVA=',
      },
      gasPrice: 618,
      gasBudget: 1000,
    },
    txSignature:
      'ANprZ/tjWOt7YBpfksRHlcRfMzHFNd1flhkSs6ld/CX8h6CYkdctIXPrcyLrUpwEDqM7XLJ1v4x/1670E6sfngv83dcb+0vmesdX0PdnU6Mte4NGe5+0kTZ3/sb71VTMNA==',
    authSignInfo: {
      epoch: 22,
      signature: 'AZKQTmXsBGPz0Z3IKNXJCiCuIkFEqmGfQnm6R+umm34ppHHMSIvre1ThTcwSAnp3zQ==',
      signers_map: [
        58, 48, 0, 0, 1, 0, 0, 0, 0, 0, 27, 0, 16, 0, 0, 0, 0, 0, 1, 0, 3, 0, 4, 0, 7, 0, 8, 0, 9, 0, 10, 0, 13, 0, 15,
        0, 16, 0, 18, 0, 19, 0, 21, 0, 22, 0, 24, 0, 25, 0, 26, 0, 27, 0, 28, 0, 29, 0, 30, 0, 31, 0, 32, 0, 33, 0, 35,
        0, 36, 0, 40, 0,
      ],
    },
  },
  effects: {
    status: {
      status: 'success',
    },
    gasUsed: {
      computationCost: 268212,
      storageCost: 95,
      storageRebate: 73,
    },
    sharedObjects: [
      {
        objectId: '0x481a9c313aa7275e6fc9ff60eba919564b385086',
        version: 2493761,
        digest: 'SoxFXUfrWjtkqQ2zfCFxykkM0epbShSqc/5JfSAJgB4=',
      },
    ],
    transactionDigest: '7DSTY6euDQKq7fn3N7654Xf1pbpSuBuYarW2c6B6ixio',
    created: [
      {
        owner: {
          AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
        },
        reference: {
          objectId: '0x3f0b179f7787ed98a2ef2e6f5c6a016c982c6c6c',
          version: 2493762,
          digest: '6HGSh1X72r21XbHg0zEo43uIkEfyVVALbASxB7N1eIs=',
        },
      },
      {
        owner: {
          AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
        },
        reference: {
          objectId: '0xa7fe715725aa608e5102765f3af7d4d85de1a24f',
          version: 2493762,
          digest: 'pTWwShZgjwZAZrVDI/i0xV25TTWEPBRbsCBBVZJsiXc=',
        },
      },
      {
        owner: {
          AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
        },
        reference: {
          objectId: '0xcd127e648c10649935a86d74833a9c22b7ccb10c',
          version: 2493762,
          digest: '0Wo2uSBUhqNGI6mveDBAwlckVKBFkW9MjPjjTiiKBHU=',
        },
      },
    ],
    mutated: [
      {
        owner: {
          Shared: {
            initial_shared_version: 1020,
          },
        },
        reference: {
          objectId: '0x481a9c313aa7275e6fc9ff60eba919564b385086',
          version: 2493762,
          digest: 'Y7lbJv2OkIe+awkSaZn6RGw6ga1IhklP1/Ij+vhu1Ns=',
        },
      },
      {
        owner: {
          AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
        },
        reference: {
          objectId: '0xd5bc168c9cbddf5918818c1d544580e97de3bd46',
          version: 2493762,
          digest: 'V1y2V81JUTb1YTAy9bh/b7QOXH4RGbZ71Pstxf+6bjQ=',
        },
      },
    ],
    deleted: [
      {
        objectId: '0x84210e7d5fb0be0b359ef8cdacb0d0448baf8478',
        version: 2493762,
        digest: 'Y2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2M=',
      },
      {
        objectId: '0xc9b60a9fd79a9536f2f49e6827a51e8e62a7a544',
        version: 2493762,
        digest: 'Y2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2M=',
      },
    ],
    gasObject: {
      owner: {
        AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
      },
      reference: {
        objectId: '0xd5bc168c9cbddf5918818c1d544580e97de3bd46',
        version: 2493762,
        digest: 'V1y2V81JUTb1YTAy9bh/b7QOXH4RGbZ71Pstxf+6bjQ=',
      },
    },
    events: [
      {
        coinBalanceChange: {
          packageId: '0x0000000000000000000000000000000000000002',
          transactionModule: 'gas',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Gas',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType: '0x2::sui::SUI',
          coinObjectId: '0xd5bc168c9cbddf5918818c1d544580e97de3bd46',
          version: 2493759,
          amount: -268234,
        },
      },
      {
        coinBalanceChange: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Receive',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType: '0x2::sui::SUI',
          coinObjectId: '0x3f0b179f7787ed98a2ef2e6f5c6a016c982c6c6c',
          version: 2493762,
          amount: 199999984,
        },
      },
      {
        mutateObject: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          objectType:
            '0x8235459df815e77668b4a49bb36e229f3321f432::pool::Pool<0x8235459df815e77668b4a49bb36e229f3321f432::pool::TestSOL, 0x2::sui::SUI>',
          objectId: '0x481a9c313aa7275e6fc9ff60eba919564b385086',
          version: 2493762,
        },
      },
      {
        coinBalanceChange: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Receive',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType:
            '0x8235459df815e77668b4a49bb36e229f3321f432::pool::LSP<0x8235459df815e77668b4a49bb36e229f3321f432::pool::TestSOL, 0x2::sui::SUI>',
          coinObjectId: '0xa7fe715725aa608e5102765f3af7d4d85de1a24f',
          version: 2493762,
          amount: 741,
        },
      },
      {
        coinBalanceChange: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Receive',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType: '0x8235459df815e77668b4a49bb36e229f3321f432::pool::TestSOL',
          coinObjectId: '0xcd127e648c10649935a86d74833a9c22b7ccb10c',
          version: 2493762,
          amount: 800000,
        },
      },
      {
        coinBalanceChange: {
          packageId: '0x0000000000000000000000000000000000000002',
          transactionModule: 'gas',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Pay',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType: '0x2::sui::SUI',
          coinObjectId: '0xd5bc168c9cbddf5918818c1d544580e97de3bd46',
          version: 2493759,
          amount: -1,
        },
      },
      {
        coinBalanceChange: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Pay',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType: '0x2::sui::SUI',
          coinObjectId: '0x84210e7d5fb0be0b359ef8cdacb0d0448baf8478',
          version: 5624,
          amount: -200000000,
        },
      },
      {
        coinBalanceChange: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          changeType: 'Pay',
          owner: {
            AddressOwner: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          },
          coinType: '0x8235459df815e77668b4a49bb36e229f3321f432::pool::TestSOL',
          coinObjectId: '0xc9b60a9fd79a9536f2f49e6827a51e8e62a7a544',
          version: 2492561,
          amount: -1000000,
        },
      },
      {
        moveEvent: {
          packageId: '0x8235459df815e77668b4a49bb36e229f3321f432',
          transactionModule: 'pool',
          sender: '0x4b63cec2b85cf31ed0ec42e5c7e79d54db1411b6',
          type: '0x8235459df815e77668b4a49bb36e229f3321f432::pool::LiquidityEvent',
          fields: {
            is_added: true,
            lsp_amount: '741',
            pool_id: '0x481a9c313aa7275e6fc9ff60eba919564b385086',
            x_amount: '200000',
            y_amount: '16',
          },
          bcs: 'SBqcMTqnJ15vyf9g66kZVks4UIYBQA0DAAAAAAAQAAAAAAAAAOUCAAAAAAAA',
        },
      },
    ],
    dependencies: [
      '4EXKjF3vTnoDEz54pDk6d2njs8roWwq3cfFAg2kUgKU4',
      '791GgUyLfBEhdsPSJ2HrHBPTm2599JLBnjbn6ySZhK3z',
      '8rq48ohgYu2QAHbwNHv1bLh8ZMgwiyghx1rzTzbWUB5B',
      'CN8EG4p7x2mWuX8Tt82kWuSWLC43Vjfgp1nDzRLkibYE',
      'DYUqe5hDjvyhG2EF2WsShTYAauVuC8oavB9U3eABScu3',
    ],
  },
  timestamp_ms: 1676013644266,
  parsed_data: null,
}
