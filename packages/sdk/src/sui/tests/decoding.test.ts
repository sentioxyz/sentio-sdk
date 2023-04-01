import { defaultMoveCoder } from '../move-coder.js'
import { dynamic_field, loadAllTypes } from '../builtin/0x2.js'
import { expect } from 'chai'
import { TypedSuiMoveObject } from '../models.js'
import { SuiAddress } from '../move-types.js'

describe('Test Sui Example', () => {
  const coder = defaultMoveCoder()
  loadAllTypes(coder)
  //
  // test('decode 1', async () => {
  //   const x = coder.decodeEvent(data1) as capy.CapyBornInstance
  // })
  //
  // test('decode 2', async () => {
  //   const x = coder.decodeEvent(data2)
  //   // console.log(JSON.stringify(x))
  // })

  test('decode dynamic fields', () => {
    const objects = data.map((d) => d.data.content)
    const res: TypedSuiMoveObject<dynamic_field.Field<string, boolean>>[] = coder.filterAndDecodeObjects(
      '0x2::dynamic_field::Field<address, bool>',
      objects
    )
    expect(res.length).eq(objects.length)

    const decodedObjects = coder.getObjectsFromDynamicFields<SuiAddress, boolean>(objects)
    expect(res.length).eq(decodedObjects.length)
    console.log(decodedObjects)
  })
})

const data = [
  {
    data: {
      objectId: '0x0002645c0afc5c5c298bea19f3a6a4dc72f763e0fe022e61cd5fed80bfcffccf',
      version: 261183,
      digest: '4pY5doijhofhKKy6dAp5Zuvh3Drig7i6FPn28UDMqo2z',
      type: '0x2::dynamic_field::Field<address, bool>',
      owner: {
        ObjectOwner: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
      },
      content: {
        dataType: 'moveObject',
        type: '0x2::dynamic_field::Field<address, bool>',
        hasPublicTransfer: false,
        fields: {
          id: {
            id: '0x0002645c0afc5c5c298bea19f3a6a4dc72f763e0fe022e61cd5fed80bfcffccf',
          },
          name: '0x489b404f8b41dd2b182ef591c7b1558ac3414e1b70b875d802ede77af4f6e602',
          value: true,
        },
      },
    },
  },
  {
    data: {
      objectId: '0x0002cd71bdbcd593ac8558cb9ae5ddd7df08861671ce8a50656a5380ce200094',
      version: 284842,
      digest: '3eEgWLdREioWdyhArwq8sRQmYhheQyUJZWzGMiurk59T',
      type: '0x2::dynamic_field::Field<address, bool>',
      owner: {
        ObjectOwner: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
      },
      content: {
        dataType: 'moveObject',
        type: '0x2::dynamic_field::Field<address, bool>',
        hasPublicTransfer: false,
        fields: {
          id: {
            id: '0x0002cd71bdbcd593ac8558cb9ae5ddd7df08861671ce8a50656a5380ce200094',
          },
          name: '0x641a3ae10ac6df38503ddf28f41ef7ed2cf90c8a9ec3db156de4f7b36f9876eb',
          value: true,
        },
      },
    },
  },
  {
    data: {
      objectId: '0x001030edc1453fd6a81af482c881d328890c0544b5756c989f17f326595161dc',
      version: 293745,
      digest: 'J5sByqHXemu6y8dPjLmW1Uu26T2Ty17UsM6zhRxhDUY8',
      type: '0x2::dynamic_field::Field<address, bool>',
      owner: {
        ObjectOwner: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
      },
      content: {
        dataType: 'moveObject',
        type: '0x2::dynamic_field::Field<address, bool>',
        hasPublicTransfer: false,
        fields: {
          id: {
            id: '0x001030edc1453fd6a81af482c881d328890c0544b5756c989f17f326595161dc',
          },
          name: '0x1ca3775163688720ba837ea455a05c70b9e15d4c8f3aaa512c8211fb029f1bde',
          value: true,
        },
      },
    },
  },
]
