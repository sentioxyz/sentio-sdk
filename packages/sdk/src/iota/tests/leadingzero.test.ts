import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { TestProcessorServer } from '../../testing/index.js'
import { event } from './types/0x00b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302.js'

describe('Test leading zero', () => {
  const service = new TestProcessorServer(async () => {
    event
      .bind({
        address: '0x0b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302'
      })
      .onEventPriceFeedUpdateEvent((evt, ctx) => {
        ctx.meter.Counter('test').add(1)
      })
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].contract?.address).eq(
      '0x00b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302'
    )
  })

  test('Check call dispatch', async () => {
    const res = await service.iota.testEvent(testData.result as any)
    expect(res.result?.counters).length(1)
  })
})

const testData = {
  jsonrpc: '2.0',
  result: {
    digest: '5ijf2PcruahTMdETHbkUGEDM3SNqmS4tCKC6XLGZPzCe',
    transaction: {
      data: {
        messageVersion: 'v1',
        transaction: {
          kind: 'ProgrammableTransaction',
          inputs: [
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0x42ef90066e649215e6ab91399a83e1a5467fd7cc436e8b83adb8743a0efba621',
              initialSharedVersion: '3478819',
              mutable: false
            },
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c',
              initialSharedVersion: '64',
              mutable: true
            },
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0xf9ff3ef935ef6cdfb659a203bf2754cebeb63346e29114a535ea6f41315e5a3f',
              initialSharedVersion: '1715793',
              mutable: true
            },
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0x168aa44fa92b27358beb17643834078b1320be6adf1b3bb0c7f018ac3591db1a',
              initialSharedVersion: '2458010',
              mutable: true
            },
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0x42afbffd3479b06f40c5576799b02ea300df36cf967adcd1ae15445270f572e2',
              initialSharedVersion: '3195547',
              mutable: true
            },
            {
              type: 'pure',
              valueType: 'u16',
              value: 3
            },
            {
              type: 'pure',
              valueType: 'vector<u8>',
              value: [
                1, 0, 0, 0, 3, 13, 0, 111, 166, 62, 255, 246, 141, 106, 253, 52, 8, 119, 134, 154, 2, 10, 0, 217, 16,
                236, 78, 93, 174, 1, 79, 196, 14, 85, 127, 103, 171, 235, 110, 107, 118, 10, 120, 204, 187, 53, 2, 131,
                119, 245, 184, 208, 163, 165, 186, 93, 134, 240, 225, 11, 74, 162, 143, 237, 142, 58, 123, 159, 203, 97,
                181, 1, 2, 36, 0, 52, 26, 219, 117, 72, 168, 91, 89, 250, 113, 40, 88, 15, 216, 118, 197, 59, 90, 85,
                187, 94, 46, 238, 201, 184, 219, 39, 235, 48, 77, 57, 187, 125, 159, 66, 135, 79, 84, 195, 95, 233, 181,
                94, 73, 160, 148, 1, 140, 56, 78, 214, 68, 44, 55, 125, 100, 59, 183, 159, 72, 229, 213, 1, 4, 7, 96,
                46, 2, 86, 96, 94, 95, 134, 105, 242, 114, 79, 196, 51, 0, 238, 180, 235, 21, 86, 75, 244, 77, 4, 41,
                218, 5, 134, 129, 213, 67, 82, 210, 164, 1, 170, 199, 220, 210, 76, 176, 66, 32, 250, 151, 161, 224, 96,
                50, 9, 82, 205, 195, 11, 220, 52, 7, 22, 205, 69, 128, 122, 251, 0, 6, 81, 132, 194, 112, 251, 68, 123,
                95, 250, 36, 233, 143, 91, 220, 167, 191, 6, 23, 57, 42, 74, 39, 213, 231, 205, 184, 130, 230, 26, 137,
                162, 108, 13, 50, 3, 14, 51, 173, 36, 85, 73, 58, 86, 191, 179, 46, 143, 26, 161, 168, 102, 86, 1, 99,
                251, 173, 243, 178, 102, 116, 245, 4, 47, 113, 1, 8, 60, 129, 90, 182, 85, 38, 181, 62, 253, 69, 124,
                138, 97, 179, 100, 3, 64, 85, 103, 69, 236, 117, 0, 47, 45, 101, 205, 6, 122, 0, 76, 217, 16, 234, 106,
                182, 162, 225, 150, 59, 107, 120, 35, 99, 198, 56, 242, 225, 85, 106, 106, 242, 233, 32, 80, 124, 185,
                199, 229, 111, 200, 233, 135, 98, 1, 11, 11, 46, 151, 218, 97, 120, 231, 186, 205, 12, 95, 215, 241,
                210, 242, 243, 197, 216, 210, 142, 7, 84, 102, 123, 227, 248, 61, 5, 170, 82, 159, 198, 0, 141, 97, 61,
                68, 97, 17, 75, 75, 182, 121, 71, 12, 32, 233, 102, 5, 247, 27, 115, 66, 215, 208, 218, 167, 158, 10,
                89, 153, 153, 59, 68, 0, 12, 156, 207, 32, 232, 128, 93, 92, 94, 87, 137, 230, 87, 149, 229, 222, 245,
                151, 210, 87, 9, 76, 110, 0, 250, 232, 66, 144, 34, 198, 80, 249, 246, 91, 9, 102, 199, 187, 132, 6,
                155, 155, 196, 90, 36, 113, 64, 207, 125, 15, 134, 115, 75, 154, 95, 34, 229, 38, 151, 42, 79, 228, 71,
                88, 111, 0, 13, 73, 170, 228, 255, 18, 181, 39, 232, 31, 208, 198, 244, 148, 221, 219, 70, 111, 29, 1,
                49, 40, 172, 7, 208, 245, 210, 75, 14, 96, 235, 214, 87, 115, 10, 131, 25, 236, 210, 19, 94, 209, 31,
                73, 39, 206, 44, 59, 47, 103, 64, 12, 160, 114, 77, 157, 191, 113, 17, 149, 56, 169, 210, 108, 205, 1,
                14, 78, 57, 177, 100, 130, 18, 38, 228, 218, 30, 136, 12, 99, 121, 84, 163, 15, 29, 153, 2, 192, 183,
                76, 51, 251, 18, 17, 188, 213, 106, 238, 16, 45, 43, 250, 193, 200, 148, 46, 110, 4, 10, 176, 73, 104,
                50, 155, 27, 108, 61, 69, 118, 134, 190, 197, 227, 228, 252, 66, 91, 13, 129, 157, 199, 1, 15, 60, 41,
                86, 240, 54, 71, 59, 106, 88, 28, 239, 130, 8, 113, 51, 252, 162, 127, 64, 151, 107, 188, 237, 211, 57,
                105, 214, 227, 149, 210, 18, 132, 32, 126, 165, 254, 164, 235, 127, 199, 166, 53, 156, 38, 35, 49, 134,
                32, 63, 149, 80, 236, 136, 93, 157, 187, 7, 175, 195, 130, 154, 255, 192, 190, 0, 16, 204, 76, 230, 163,
                31, 6, 160, 143, 255, 0, 2, 76, 136, 67, 193, 42, 30, 135, 85, 179, 136, 118, 84, 106, 52, 168, 112, 26,
                180, 104, 116, 49, 32, 220, 223, 62, 54, 255, 37, 198, 242, 166, 85, 61, 239, 139, 142, 71, 91, 225,
                174, 44, 201, 29, 65, 135, 2, 69, 109, 28, 69, 218, 83, 77, 0, 17, 92, 215, 80, 226, 2, 50, 69, 250,
                121, 45, 44, 236, 155, 15, 108, 148, 150, 131, 134, 97, 127, 185, 233, 31, 40, 78, 60, 218, 160, 96,
                206, 54, 107, 158, 110, 165, 139, 189, 94, 226, 54, 61, 44, 62, 195, 74, 124, 14, 57, 51, 135, 212, 88,
                47, 19, 115, 126, 85, 67, 197, 239, 32, 50, 237, 0, 18, 137, 235, 233, 230, 125, 62, 53, 117, 13, 152,
                234, 224, 91, 90, 137, 247, 141, 235, 57, 247, 253, 104, 192, 213, 185, 79, 144, 107, 14, 239, 173, 126,
                5, 70, 91, 174, 250, 103, 45, 69, 119, 186, 30, 141, 141, 254, 126, 155, 115, 109, 104, 0, 95, 115, 43,
                5, 30, 135, 253, 29, 62, 178, 216, 79, 1, 100, 136, 91, 202, 0, 0, 0, 0, 0, 26, 248, 205, 35, 194, 171,
                145, 35, 119, 48, 119, 11, 190, 160, 141, 97, 0, 92, 221, 160, 152, 67, 72, 243, 246, 238, 203, 85, 150,
                56, 192, 187, 160, 0, 0, 0, 0, 28, 27, 62, 67, 1, 80, 50, 87, 72, 0, 3, 0, 1, 0, 1, 2, 0, 5, 0, 157,
                176, 225, 60, 227, 38, 13, 136, 75, 4, 23, 198, 180, 209, 82, 212, 91, 47, 19, 153, 26, 133, 146, 82,
                47, 173, 0, 104, 164, 188, 227, 223, 189, 240, 213, 125, 236, 165, 123, 61, 162, 254, 99, 164, 147, 244,
                194, 89, 37, 253, 253, 142, 223, 131, 75, 32, 249, 62, 31, 132, 219, 209, 80, 77, 74, 0, 0, 0, 0, 0, 1,
                12, 142, 0, 0, 0, 0, 0, 0, 0, 114, 255, 255, 255, 246, 0, 0, 0, 0, 0, 1, 9, 11, 0, 0, 0, 0, 0, 0, 0, 89,
                1, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 0, 100, 136, 91, 202, 0, 0, 0, 0, 100, 136, 91, 202, 0, 0, 0, 0,
                100, 136, 91, 201, 0, 0, 0, 0, 0, 1, 12, 142, 0, 0, 0, 0, 0, 0, 0, 113, 0, 0, 0, 0, 100, 136, 91, 200,
                138, 176, 60, 255, 24, 68, 171, 151, 93, 205, 209, 104, 48, 32, 192, 89, 159, 197, 57, 43, 111, 46, 18,
                213, 221, 97, 91, 204, 44, 46, 109, 8, 239, 13, 139, 111, 218, 44, 235, 164, 29, 161, 93, 64, 149, 209,
                218, 57, 42, 13, 47, 142, 208, 198, 199, 188, 15, 76, 250, 200, 194, 128, 181, 109, 0, 0, 0, 0, 93, 184,
                114, 96, 0, 0, 0, 0, 0, 23, 255, 21, 255, 255, 255, 248, 0, 0, 0, 0, 92, 150, 151, 22, 0, 0, 0, 0, 0,
                22, 200, 76, 1, 0, 0, 0, 26, 0, 0, 0, 30, 0, 0, 0, 0, 100, 136, 91, 202, 0, 0, 0, 0, 100, 136, 91, 202,
                0, 0, 0, 0, 100, 136, 91, 201, 0, 0, 0, 0, 93, 184, 114, 96, 0, 0, 0, 0, 0, 26, 35, 95, 0, 0, 0, 0, 100,
                136, 91, 201, 18, 122, 179, 133, 240, 121, 207, 2, 222, 90, 108, 11, 200, 65, 66, 103, 172, 208, 134,
                253, 38, 135, 48, 202, 243, 25, 232, 107, 136, 210, 52, 41, 35, 215, 49, 81, 19, 245, 177, 211, 186,
                122, 131, 96, 76, 68, 185, 77, 121, 244, 253, 105, 175, 119, 248, 4, 252, 127, 146, 10, 109, 198, 87,
                68, 0, 0, 0, 0, 4, 48, 161, 21, 0, 0, 0, 0, 0, 0, 175, 240, 255, 255, 255, 248, 0, 0, 0, 0, 4, 44, 160,
                120, 0, 0, 0, 0, 0, 1, 11, 206, 1, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 0, 100, 136, 91, 202, 0, 0, 0, 0,
                100, 136, 91, 202, 0, 0, 0, 0, 100, 136, 91, 201, 0, 0, 0, 0, 4, 48, 157, 216, 0, 0, 0, 0, 0, 0, 172,
                179, 0, 0, 0, 0, 100, 136, 91, 201, 193, 46, 93, 25, 140, 156, 103, 62, 156, 224, 50, 101, 231, 217,
                190, 105, 205, 106, 12, 103, 74, 171, 211, 210, 196, 31, 245, 118, 64, 35, 226, 40, 120, 209, 133, 167,
                65, 208, 126, 219, 52, 18, 176, 144, 8, 183, 197, 207, 185, 187, 189, 125, 86, 139, 240, 11, 167, 55,
                180, 86, 186, 23, 21, 1, 0, 0, 0, 0, 26, 90, 133, 96, 0, 0, 0, 0, 0, 5, 159, 100, 255, 255, 255, 248, 0,
                0, 0, 0, 25, 252, 2, 116, 0, 0, 0, 0, 0, 6, 199, 136, 1, 0, 0, 0, 21, 0, 0, 0, 23, 0, 0, 0, 0, 100, 136,
                91, 202, 0, 0, 0, 0, 100, 136, 91, 202, 0, 0, 0, 0, 100, 136, 91, 201, 0, 0, 0, 0, 26, 90, 133, 96, 0,
                0, 0, 0, 0, 5, 159, 100, 0, 0, 0, 0, 100, 136, 91, 201, 107, 250, 211, 171, 42, 214, 237, 89, 89, 26,
                90, 119, 204, 155, 22, 47, 142, 34, 142, 137, 239, 86, 21, 27, 36, 225, 84, 38, 162, 187, 77, 72, 234,
                160, 32, 198, 28, 196, 121, 113, 40, 19, 70, 28, 225, 83, 137, 74, 150, 166, 192, 11, 33, 237, 12, 252,
                39, 152, 209, 249, 169, 233, 201, 74, 0, 0, 0, 0, 5, 245, 219, 36, 0, 0, 0, 0, 0, 0, 106, 64, 255, 255,
                255, 248, 0, 0, 0, 0, 5, 245, 221, 210, 0, 0, 0, 0, 0, 0, 112, 124, 1, 0, 0, 0, 17, 0, 0, 0, 23, 0, 0,
                0, 0, 100, 136, 91, 202, 0, 0, 0, 0, 100, 136, 91, 202, 0, 0, 0, 0, 100, 136, 91, 201, 0, 0, 0, 0, 5,
                245, 219, 36, 0, 0, 0, 0, 0, 0, 106, 64, 0, 0, 0, 0, 100, 136, 91, 200
              ]
            },
            {
              type: 'object',
              objectType: 'sharedObject',
              objectId: '0x0000000000000000000000000000000000000000000000000000000000000006',
              initialSharedVersion: '1',
              mutable: false
            },
            {
              type: 'object',
              objectType: 'immOrOwnedObject',
              objectId: '0x1d038d2b9460ab2f78166678991700e65ee55f8c824b254ffb407e66f81ceaf5',
              version: '5015234',
              digest: '3uUMEorjZS3YpkGf43i79MSXy6gpkgMGdANx7kFWfDi3'
            }
          ],
          transactions: [
            {
              MoveCall: {
                package: '0xc5b2a5049cd71586362d0c6a38e34cfaae7ea9ce6d5401a350506a15f817bf72',
                module: 'oracle',
                function: 'feed_token_price_by_pyth',
                arguments: [
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
                  },
                  {
                    Input: 4
                  },
                  {
                    Input: 5
                  },
                  {
                    Input: 6
                  },
                  {
                    Input: 7
                  },
                  {
                    Input: 8
                  }
                ]
              }
            }
          ]
        },
        sender: '0x1e549762ed8f6af7d8f2ce3d41b5344a84899f60f38549d8b4307236ba4274a4',
        gasData: {
          payment: [
            {
              objectId: '0x085062178149efc374d7acd6f549d97bd77ffcd789833fa184aa70a1cdcfce11',
              version: 5015234,
              digest: 'EP69bZtqfJHH7dXgYduWzMyWmm3o4JdTT3KgK7qSveBt'
            }
          ],
          owner: '0x1e549762ed8f6af7d8f2ce3d41b5344a84899f60f38549d8b4307236ba4274a4',
          price: '815',
          budget: '500000000'
        }
      },
      txSignatures: [
        'AGfZ4IMzEspDbGEFGZpkf4Ehf+giYqLswvrQE56/l86oj+RQN+910LrxPfrBb+28ydWwECQXfeboUfugx/0dbA3gl6Yf52PzU8JWuJDyfzPxAoCO09QdZAVSN/xZ9+uH0A=='
      ]
    },
    rawTransaction:
      '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',
    effects: {
      messageVersion: 'v1',
      status: {
        status: 'success'
      },
      executedEpoch: '61',
      gasUsed: {
        computationCost: '163000000',
        storageCost: '14067600',
        storageRebate: '13926924',
        nonRefundableStorageFee: '140676'
      },
      modifiedAtVersions: [
        {
          objectId: '0x085062178149efc374d7acd6f549d97bd77ffcd789833fa184aa70a1cdcfce11',
          sequenceNumber: '5015234'
        },
        {
          objectId: '0x168aa44fa92b27358beb17643834078b1320be6adf1b3bb0c7f018ac3591db1a',
          sequenceNumber: '5015014'
        },
        {
          objectId: '0x1d038d2b9460ab2f78166678991700e65ee55f8c824b254ffb407e66f81ceaf5',
          sequenceNumber: '5015234'
        },
        {
          objectId: '0x42afbffd3479b06f40c5576799b02ea300df36cf967adcd1ae15445270f572e2',
          sequenceNumber: '5015233'
        },
        {
          objectId: '0x68082de60ea45d29eff51f2aa9bd288900634752495f29f690fc49f2de2a8804',
          sequenceNumber: '5012802'
        },
        {
          objectId: '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c',
          sequenceNumber: '5015233'
        },
        {
          objectId: '0xf9ff3ef935ef6cdfb659a203bf2754cebeb63346e29114a535ea6f41315e5a3f',
          sequenceNumber: '5015233'
        }
      ],
      sharedObjects: [
        {
          objectId: '0x42ef90066e649215e6ab91399a83e1a5467fd7cc436e8b83adb8743a0efba621',
          version: 4346052,
          digest: '97QWr9zmCmV9L7WJHmG6ynSLbwtXtqaxEvJPzCw5r7ZK'
        },
        {
          objectId: '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c',
          version: 5015233,
          digest: '7bR9BfhzayH561FNiM5BQesbvhEhh11E2rmGmPtDx6jq'
        },
        {
          objectId: '0xf9ff3ef935ef6cdfb659a203bf2754cebeb63346e29114a535ea6f41315e5a3f',
          version: 5015233,
          digest: '9VPLQWR4D3RbJPrqAaFTZhM2qCLtTyNaVD9oqVeUaioj'
        },
        {
          objectId: '0x168aa44fa92b27358beb17643834078b1320be6adf1b3bb0c7f018ac3591db1a',
          version: 5015014,
          digest: 'fJ2jnDsEboHnYa8EZoau9yhPgezin8rW8KSCm5o91kr'
        },
        {
          objectId: '0x42afbffd3479b06f40c5576799b02ea300df36cf967adcd1ae15445270f572e2',
          version: 5015233,
          digest: 'GNxCPi1fKoAckPKZAkf2mmq3ycEd9M3rjSH39v6FZtCv'
        },
        {
          objectId: '0x0000000000000000000000000000000000000000000000000000000000000006',
          version: 5015239,
          digest: 'FL5FWLdE5c5jsmrL7er3hLJaQxAzWUfrG7ccvLvPZNDK'
        }
      ],
      transactionDigest: '5ijf2PcruahTMdETHbkUGEDM3SNqmS4tCKC6XLGZPzCe',
      mutated: [
        {
          owner: {
            AddressOwner: '0x1e549762ed8f6af7d8f2ce3d41b5344a84899f60f38549d8b4307236ba4274a4'
          },
          reference: {
            objectId: '0x085062178149efc374d7acd6f549d97bd77ffcd789833fa184aa70a1cdcfce11',
            version: 5015240,
            digest: '94WPJHTXwXQ2pVQs76tU4dvQnCZxwBkpNAgCwHZf7GzS'
          }
        },
        {
          owner: {
            Shared: {
              initial_shared_version: 2458010
            }
          },
          reference: {
            objectId: '0x168aa44fa92b27358beb17643834078b1320be6adf1b3bb0c7f018ac3591db1a',
            version: 5015240,
            digest: 'HU5XvJfCQJdxzBtBfrjirnp6zFhSM8eMoBZ7G4VvbNsc'
          }
        },
        {
          owner: {
            AddressOwner: '0x8a0fac6e8b1ddbec8b61f2a55a1025c94a60f5dadda8e0990eed4029f52bea39'
          },
          reference: {
            objectId: '0x1d038d2b9460ab2f78166678991700e65ee55f8c824b254ffb407e66f81ceaf5',
            version: 5015240,
            digest: '8ZxjScYNmtHBmQgu2iFi8X15RHpxyQe6t5Hj5uDnDCy9'
          }
        },
        {
          owner: {
            Shared: {
              initial_shared_version: 3195547
            }
          },
          reference: {
            objectId: '0x42afbffd3479b06f40c5576799b02ea300df36cf967adcd1ae15445270f572e2',
            version: 5015240,
            digest: '5xJRu8TxwXCLPrFQuwqGPGJYvmAT9YzTfuXeNBqRgy5f'
          }
        },
        {
          owner: {
            ObjectOwner: '0x3f5680ba7f16e418e7b8108f2c77cf0da8b52f3e786b0ebba7e112bc3348ff5c'
          },
          reference: {
            objectId: '0x68082de60ea45d29eff51f2aa9bd288900634752495f29f690fc49f2de2a8804',
            version: 5015240,
            digest: 'FiXrj1nBYgy7LjL5RHKhowPHnfHrB97gmss2jUjnDw76'
          }
        },
        {
          owner: {
            Shared: {
              initial_shared_version: 64
            }
          },
          reference: {
            objectId: '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c',
            version: 5015240,
            digest: '4qjuNhZrc3bvUQw2o4BjdYg5wtqW971on6Ez5kZJKEDL'
          }
        },
        {
          owner: {
            Shared: {
              initial_shared_version: 1715793
            }
          },
          reference: {
            objectId: '0xf9ff3ef935ef6cdfb659a203bf2754cebeb63346e29114a535ea6f41315e5a3f',
            version: 5015240,
            digest: 'GdyYhowwHV6rciUzyX9h66YR7rvfJNDhMhYNcVkjU2JC'
          }
        }
      ],
      gasObject: {
        owner: {
          AddressOwner: '0x1e549762ed8f6af7d8f2ce3d41b5344a84899f60f38549d8b4307236ba4274a4'
        },
        reference: {
          objectId: '0x085062178149efc374d7acd6f549d97bd77ffcd789833fa184aa70a1cdcfce11',
          version: 5015240,
          digest: '94WPJHTXwXQ2pVQs76tU4dvQnCZxwBkpNAgCwHZf7GzS'
        }
      },
      eventsDigest: 'EAoV1d5Krg9QBHTC5n7fHdFLE3eEzrMnBPni2a21ET6w',
      dependencies: [
        'ozN2rhczEUC39poaeVYxMN6b6TEAjiFX7jFSQFhbKmL',
        '4ErTmwM5YdWZhTJGxFkRaqhiboBYkMQPqjheRJMp9iQ7',
        '5dewCcmLQ3LhV1QDcXWrCiV2WQJHT5sJEpnzpXu37adX',
        '6B3tXa5PpoaRUQiYcytsC1M9fkfzXUc49NsWgC335qC1',
        '9GcDgctugjkrK7b4Ty5AaUpdNpbw4FmdgSjHwT4KV8Gi',
        'F43pAssTYU9kPn7pzRRQYpqBCHMbKaVTt3dJPo2jfLTA'
      ]
    },
    events: [
      {
        id: {
          txDigest: '5ijf2PcruahTMdETHbkUGEDM3SNqmS4tCKC6XLGZPzCe',
          eventSeq: '1'
        },
        packageId: '0x826915f8ca6d11597dfe6599b8aa02a4c08bd8d39674855254a06ee83fe7220e',
        transactionModule: 'oracle',
        sender: '0x1e549762ed8f6af7d8f2ce3d41b5344a84899f60f38549d8b4307236ba4274a4',
        type: '0x00b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302::event::PriceFeedUpdateEvent',
        parsedJson: {
          price_feed: {
            ema_price: {
              conf: '68558',
              expo: {
                magnitude: '8',
                negative: true
              },
              price: {
                magnitude: '70033528',
                negative: false
              },
              timestamp: '1686657994'
            },
            price: {
              conf: '45040',
              expo: {
                magnitude: '8',
                negative: true
              },
              price: {
                magnitude: '70295829',
                negative: false
              },
              timestamp: '1686657994'
            },
            price_identifier: {
              bytes: [
                35, 215, 49, 81, 19, 245, 177, 211, 186, 122, 131, 96, 76, 68, 185, 77, 121, 244, 253, 105, 175, 119,
                248, 4, 252, 127, 146, 10, 109, 198, 87, 68
              ]
            }
          },
          timestamp: '1686657997'
        },
        bcs: '555G1QhNGQae4HdD92nV1aWUJqZGUGESEsXBHFgkaw3u4NR9qTxtkWw4tksFhdaumvpPFuNynu6fHJNQipoFijRc2eDdZA5C2bf2JQDRnaV3zo8nXC4EKcfTf5JmQ9eDQ9R51AqGXpDCtr1YVwhUs'
      }
    ],
    balanceChanges: [
      {
        owner: {
          AddressOwner: '0x1e549762ed8f6af7d8f2ce3d41b5344a84899f60f38549d8b4307236ba4274a4'
        },
        coinType: '0x2::sui::SUI',
        amount: '-163140677'
      },
      {
        owner: {
          AddressOwner: '0x8a0fac6e8b1ddbec8b61f2a55a1025c94a60f5dadda8e0990eed4029f52bea39'
        },
        coinType: '0x2::sui::SUI',
        amount: '1'
      }
    ],
    timestampMs: '1686657997254',
    checkpoint: '5015238'
  },
  id: 1
}
