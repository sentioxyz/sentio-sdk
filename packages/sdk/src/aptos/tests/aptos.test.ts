import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { HandlerType, ProcessBindingsRequest } from '@sentio/protos'

import { firstCounterValue, firstGaugeValue, TestProcessorServer } from '../../testing/index.js'
import { ChainId } from '@sentio/chain'

describe('Test Aptos Example', () => {
  const service = new TestProcessorServer(async () => {
    await import('./souffl3.js')
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(5)

    expect(config.accountConfigs).length(6)
  })

  test('Check souffl3 transaction dispatch', async () => {
    const config = await service.getConfig({})
    const handlerId = config.contractConfigs[0].moveCallConfigs[1].handlerId
    const request: ProcessBindingsRequest = {
      bindings: [
        {
          data: {
            aptCall: {
              rawTransaction: JSON.stringify(testData)
            }
          },
          handlerIds: [handlerId],
          handlerType: HandlerType.APT_CALL,
          chainId: ChainId.APTOS_MAINNET
        }
      ]
    }
    const res = await service.processBindings(request)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber).equal(18483034n)
  })

  test('Check souffl3 function call dispatch', async () => {
    const res = await service.aptos.testEntryFunctionCall(testData as any)
    expect(res.result?.counters).length(2)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber).equal(18483034n)
  })

  test('Check souffl3 event dispatch', async () => {
    const res = await service.aptos.testEvent(testData as any)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber).equal(18483034n)
    expect(res.result?.events).length(1)
  })

  test('Check token deposit event dispatch', async () => {
    testData.events = [tokenTestData]
    const res = await service.aptos.testEvent(testData as any)
    expect(firstCounterValue(res.result, 'deposit')).equal(1n)
    expect(firstGaugeValue(res.result, 'version')).equal(0n)
  })

  test('Check create poposal event dispatch', async () => {
    testData.events = [createProposalData as any]
    const res = await service.aptos.testEvent(testData as any)
    expect(firstGaugeValue(res.result, 'size')).equal(2)
  })

  test('check on timer', async () => {
    const config = await service.getConfig({})
    const handlerId = config.accountConfigs[5].moveIntervalConfigs[0].intervalConfig?.handlerId ?? 0
    const request: ProcessBindingsRequest = {
      bindings: [
        {
          data: {
            aptResource: {
              version: 12345n,
              rawResources: [
                JSON.stringify({
                  type: '0x1::coin::SupplyConfig',
                  data: {
                    allow_upgrades: false
                  }
                })
              ],
              timestampMicros: 1n
            }
          },
          handlerIds: [handlerId],
          handlerType: HandlerType.APT_RESOURCE,
          chainId: ChainId.APTOS_MAINNET
        }
      ]
    }
    const res = await service.processBindings(request)
    expect(firstCounterValue(res.result, 'onTimer')).equal(1)
  })

  test('Check aptos account transaction dispatch', async () => {
    const config = await service.getConfig({})
    const handlerId = config.contractConfigs[4].moveCallConfigs[0].handlerId
    const request: ProcessBindingsRequest = {
      bindings: [
        {
          data: {
            aptCall: {
              rawTransaction: JSON.stringify(dataCreate)
            }
          },
          handlerIds: [handlerId],
          handlerType: HandlerType.APT_CALL,
          chainId: ChainId.APTOS_MAINNET
        }
      ]
    }
    const res = await service.processBindings(request)
    expect(res.result?.counters).length(1)
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
      '1'
    ],
    type: 'entry_function_payload'
  },
  signature: {
    public_key: '0x6c3f579afbf8a728827385039f7604ec1d06e5c802d8f9689ee8ec9d349fedc5',
    signature:
      '0xd2db95052e774f095d924030a50c29325a17e8d69d35c748f45bb0e22eb7d3b9e47545c98bd7130fd3ef46cbedc30c9aaeaf39c2d922ee8e7d578c0b1e76f30b',
    type: 'ed25519_signature'
  },
  events: [
    {
      guid: {
        creation_number: '3',
        account_address: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807'
      },
      sequence_number: '10',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '1'
      }
    },
    {
      version: '18483034',
      guid: {
        creation_number: '2',
        account_address: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807'
      },
      sequence_number: '11',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '1'
      }
    },
    {
      guid: {
        creation_number: '9',
        account_address: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc'
      },
      sequence_number: '9',
      type: '0x3::token::CreateTokenDataEvent',
      data: {
        description:
          'Souffl3 offers a one-stop marketplace for the launch, listing, and trading of NFT assets on APTOS.\nWebsite：https://souffl3.com/\nEveryone can win through our Bake Off campaign on the Aptos Testnet, rewards including Souffl3 Genesis NFT and whitelists of other collab projects, everyone is welcome to participate!',
        id: {
          collection: 'Souffl3 BlueBerry',
          creator: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc',
          name: 'Souffl3 BlueBerry #2'
        },
        maximum: '999999999999',
        mutability_config: {
          description: true,
          maximum: true,
          properties: true,
          royalty: true,
          uri: true
        },
        name: 'Souffl3 BlueBerry #2',
        property_keys: ['author', 'point'],
        property_types: ['string', 'integer'],
        property_values: ['0x33454e4a4f59204c616273', '0x30'],
        royalty_payee_address: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807',
        royalty_points_denominator: '100',
        royalty_points_numerator: '20',
        uri: 'https://y3x4txhvirx5zl57efzbl6dg7psaier5q35hhwuqwzjwuahrycya.arweave.net/xu_J3PVEb9yvvyFyFfhm--QEEj2G-nPakLZTagDxwLA'
      }
    },
    {
      guid: {
        creation_number: '2',
        account_address: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc'
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
            name: 'Souffl3 BlueBerry #2'
          }
        }
      }
    },
    {
      version: '18483034',
      guid: {
        creation_number: '7',
        account_address: '0x21d5fe032affa1c8b10d343e9ad5a5618bc13baf5ed4a674fafaa12c54f416cc'
      },
      sequence_number: '980533',
      type: '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807::SouffleChefCampaign::PullTokenEvent<0x1::aptos_coin::AptosCoin>',
      data: {
        receiver: '0x3a80be5daa84f2da7e07b3ec9234da48a5647f757187879c97a1fa03f31f1195'
      }
    }
  ],
  timestamp: '1663143945131218',
  type: 'user_transaction'
}

const tokenTestData = {
  guid: {
    creation_number: '4',
    account_address: '0x89bc80de59187f707a59ae7a4121718dafe3e6068e0509104ef7e41a56bc97db'
  },
  sequence_number: '10',
  type: '0x3::token::DepositEvent',
  data: {
    amount: '1',
    id: {
      property_version: '0',
      token_data_id: {
        collection: 'Topaz Troopers',
        creator: '0x9125e4054d884fdc7296b66e12c0d63a7baa0d88c77e8e784987c0a967c670ac',
        name: 'Topaz Trooper #11293'
      }
    }
  }
}

const createProposalData = {
  version: '1',
  guid: {
    creation_number: '5',
    account_address: '0x1'
  },
  sequence_number: '3',
  type: '0x1::voting::CreateProposalEvent',
  data: {
    early_resolution_vote_threshold: {
      vec: ['9272156337856446330']
    },
    execution_hash: '0x31549239ce8abdc1e9c259178614c3d44d015bd6d48635ddcfbfa4a77e7222b0',
    expiration_secs: '1665463839',
    metadata: {
      data: [
        {
          key: 'metadata_hash',
          value:
            '0x61633230656566373063616466363939663530353564323463356363353931396463306330656562643463303662653332346336323030313561633361653066'
        },
        {
          key: 'metadata_location',
          value:
            '0x68747470733a2f2f676973742e67697468756275736572636f6e74656e742e636f6d2f6d6f76656b6576696e2f30353766623134356234303836366566663863323263393166623964613931392f7261772f626162383566306637343334663030386138373831656563376663616464316163356135353438312f6769737466696c65312e747874'
        }
      ]
    },
    min_vote_threshold: '100000000000000',
    proposal_id: '3'
  }
}

const dataCreate = {
  id: '',
  round: '',
  previous_block_votes: undefined,
  proposer: '',
  sender: '0x88252db4dc2484cd9cedb23cd67b7b91f88940142f3eea35df7a9168d9c30896',
  sequence_number: '1510',
  payload: {
    type: 'entry_function_payload',
    type_arguments: [],
    arguments: ['0xd582e092190feda35a2f737123f86e33a1b592596804f40b1d539ab603a82a24'],
    code: { bytecode: '' },
    function: '0x1::aptos_account::create_account'
  },
  max_gas_amount: '2000',
  gas_unit_price: '100',
  expiration_timestamp_secs: '1666174748',
  secondary_signers: null,
  signature: {
    type: 'ed25519_signature',
    public_key: '0xfe1e11c6cb912ae998c9512d21e5781abb64fd4b8d6cfa15aeba3ee481406b64',
    signature:
      '0x98a49f348a3015702e3be33c1d2a92ea7b2726d31b27c857980493fe68cadc83fbef0839e312d6a82a9e6ca69481245fa49b6f25c0ec51660615d03e05738c03',
    public_keys: null,
    signatures: null,
    threshold: 0,
    bitmap: '',
    sender: { type: '', public_key: '', signature: '', public_keys: null, signatures: null, threshold: 0, bitmap: '' },
    secondary_signer_addresses: null,
    secondary_signers: null
  },
  type: 'user_transaction',
  timestamp: '1666174688494614',
  events: [
    {
      version: '3121410',
      guid: {
        creation_number: '0',
        account_address: '0xd582e092190feda35a2f737123f86e33a1b592596804f40b1d539ab603a82a24'
      },
      sequence_number: '0',
      type: '0x1::account::CoinRegisterEvent',
      data: {
        type_info: {
          account_address: '0x1',
          module_name: '0x6170746f735f636f696e',
          struct_name: '0x4170746f73436f696e'
        }
      }
    }
  ],
  version: '3121410',
  hash: '0xcae7d97c9f43d90e247a366688905bc8e83ee0ad4baddbf3cc2fdda56e4d6926',
  state_root_hash: '',
  event_root_hash: '0xfa557e3bb8dff8fd3321f9a4eaa779311c9c795728355686b487b5b0adf7ce3c',
  gas_used: '1538',
  success: true,
  vm_status: 'Executed successfully',
  accumulator_root_hash: '0x7563d6ed58b011e512d53cce2bc1a70716fc6362e12fb6af8fe6d459ae71dffc',
  changes: undefined
}
