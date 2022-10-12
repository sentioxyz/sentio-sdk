import { expect } from 'chai'
import { TextEncoder } from 'util'
import { HandlerType, ProcessBindingsRequest } from '..'

import { TestProcessorServer } from '../testing'

describe('Test Aptos Example', () => {
  const service = new TestProcessorServer(() => {
    require('./souffl3')
  })

  beforeAll(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
  })

  test('Check souffl3 transaction dispatch', async () => {
    const request: ProcessBindingsRequest = {
      bindings: [
        {
          data: {
            raw: new TextEncoder().encode(JSON.stringify(testData)),
          },
          handlerId: 0,
          handlerType: HandlerType.APT_CALL,
        },
      ],
    }
    const res = await service.processBindings(request)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(18483034)
  })

  test('Check souffl3 function call dispatch', async () => {
    const request: ProcessBindingsRequest = {
      bindings: [
        {
          data: {
            raw: new TextEncoder().encode(JSON.stringify(testData)),
          },
          handlerId: 1,
          handlerType: HandlerType.APT_CALL,
        },
      ],
    }
    const res = await service.processBindings(request)
    expect(res.result?.counters).length(2)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(18483034)
  })

  test('Check souffl3 event dispatch', async () => {
    const request: ProcessBindingsRequest = {
      bindings: [
        {
          data: {
            raw: new TextEncoder().encode(JSON.stringify(testData.events[1])),
          },
          handlerId: 0,
          handlerType: HandlerType.APT_EVENT,
        },
      ],
    }
    const res = await service.processBindings(request)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(18483034)
  })
})

const testData = {
  version: '18483034',
  hash: '0xbf4df6f390546a793ba9b7caff120002b3257986dbea9c697fd64acf7dfeb052',
  state_change_hash: '0x6063039cca5a1eb33d3986d3665fc783238579961eaa4746c41e25fa4f72aac6',
  event_root_hash: '0x425e39bcf994672108f83c34f637e84166af7ecedcbe26aed0dff0d62da8055d',
  state_checkpoint_hash: null,
  gas_used: '854',
  success: true,
  vm_status: 'Executed successfully',
  accumulator_root_hash: '0x47aa479d9e15993ea2abe04043c89186fb5da0b5eb8b5c6d18bd55d5f0c2c877',
  changes: [],
  sender: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
  sequence_number: '30',
  max_gas_amount: '20000',
  gas_unit_price: '1',
  expiration_timestamp_secs: '1663144544',
  payload: {
    function: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807::SouffleChefCampaign::pull_token_v2',
    type_arguments: ['0x1::aptos_coin::AptosCoin'],
    arguments: [
      '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
      '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
      'Souffl3 BlueBerry',
      '1',
    ],
    type: 'entry_function_payload',
  },
  signature: {
    public_key: '0x6c3f579afbf8a728827385039f7604ec1d06e5c802d8f9689ee8ec9d349fedc5',
    signature:
      '0xd2db95052e774f095d924030a50c29325a17e8d69d35c748f45bb0e22eb7d3b9e47545c98bd7130fd3ef46cbedc30c9aaeaf39c2d922ee8e7d578c0b1e76f30b',
    type: 'ed25519_signature',
  },
  events: [
    {
      guid: {
        creation_number: '3',
        account_address: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
      },
      sequence_number: '10',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '1',
      },
    },
    {
      version: '18483034',
      guid: {
        creation_number: '2',
        account_address: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
      },
      sequence_number: '11',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '1',
      },
    },
    {
      guid: {
        creation_number: '9',
        account_address: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc',
      },
      sequence_number: '9',
      type: '0x3::token::CreateTokenDataEvent',
      data: {
        description:
          'Souffl3 offers a one-stop marketplace for the launch, listing, and trading of NFT assets on APTOS.\nWebsite：https://souffl3.com/\nEveryone can win through our Bake Off campaign on the Aptos Testnet, rewards including Souffl3 Genesis NFT and whitelists of other collab projects, everyone is welcome to participate!',
        id: {
          collection: 'Souffl3 BlueBerry',
          creator: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc',
          name: 'Souffl3 BlueBerry #2',
        },
        maximum: '999999999999',
        mutability_config: {
          description: true,
          maximum: true,
          properties: true,
          royalty: true,
          uri: true,
        },
        name: 'Souffl3 BlueBerry #2',
        property_keys: ['author', 'point'],
        property_types: ['string', 'integer'],
        property_values: ['0x33454e4a4f59204c616273', '0x30'],
        royalty_payee_address: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
        royalty_points_denominator: '100',
        royalty_points_numerator: '20',
        uri: 'https://y3x4txhvirx5zl57efzbl6dg7psaier5q35hhwuqwzjwuahrycya.arweave.net/xu_J3PVEb9yvvyFyFfhm--QEEj2G-nPakLZTagDxwLA',
      },
    },
    {
      guid: {
        creation_number: '2',
        account_address: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc',
      },
      sequence_number: '27',
      type: '0x3::token::DepositEvent',
      data: {
        amount: '1',
        id: {
          property_version: '0',
          token_data_id: {
            collection: 'Souffl3 BlueBerry',
            creator: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc',
            name: 'Souffl3 BlueBerry #2',
          },
        },
      },
    },
  ],
  timestamp: '1663143945131218',
  type: 'user_transaction',
}
