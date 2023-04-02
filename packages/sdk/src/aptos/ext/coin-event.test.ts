import { getDepositCoinType, getWithDrawCoinType } from './coin-event.js'
import { expect } from 'chai'
import { Transaction_UserTransaction } from '../move-types.js'

describe('resource change ', () => {
  test('withdraw usdc', () => {
    const evt = tx.events[0]
    const type = getWithDrawCoinType(evt, tx)
    expect(type).eq('0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC')
  })

  test('deposit usdc', () => {
    const evt = tx.events[1]
    const type = getDepositCoinType(evt, tx)
    expect(type).eq('0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC')
  })

  test('deposit thl', () => {
    const evt = tx.events[4]
    const type = getDepositCoinType(evt, tx)
    expect(type).eq('0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL')
  })
})

const tx: Transaction_UserTransaction = {
  version: '112145263',
  hash: '0xe8a9cc7e974ce2c0b737241f034e76dc03c6b6e2eea2deb3538ba9c5fa18c6c6',
  state_change_hash: '0xc8e8d9cebaf525d1a330cd68bfcff596e364f67df37ccb50a4ad2f5ce7855e36',
  event_root_hash: '0x419261b51b786ac315ada03ec34be32cf2187c4f5e8604fa71d6896b1a371108',
  gas_used: '10974',
  success: true,
  vm_status: 'Executed successfully',
  accumulator_root_hash: '0x8d56f2a61ffe3df0565850cb2e8a7e4d94c2dc6a8401e51d55946932de25309f',
  changes: [
    {
      address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      state_key_hash: '0x06c0d616285a1917619b93784eeca7deeb42fcc4c3a3fceaa050afa372543182',
      data: {
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          coin: {
            value: '508465811',
          },
          deposit_events: {
            counter: '5',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '2',
              },
            },
          },
          frozen: false,
          withdraw_events: {
            counter: '20',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '3',
              },
            },
          },
        },
      },
      type: 'write_resource',
    },
    {
      address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      state_key_hash: '0x0bf2b538b396fedbd1aa90cabfdc29ba93c466b0c110b5ffb81305aa6e82ef16',
      data: {
        type: '0x1::coin::CoinStore<0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL>',
        data: {
          coin: {
            value: '5811069565',
          },
          deposit_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '17',
              },
            },
          },
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '18',
              },
            },
          },
        },
      },
      type: 'write_resource',
    },
    {
      address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      state_key_hash: '0x43f2dc6124f3c13a30d716c0359d50246ecaec8376c9928e87d1bc8895e6b51e',
      data: {
        type: '0x1::coin::CoinStore<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          coin: {
            value: '103679210',
          },
          deposit_events: {
            counter: '2',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '15',
              },
            },
          },
          frozen: false,
          withdraw_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '16',
              },
            },
          },
        },
      },
      type: 'write_resource',
    },
    {
      address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      state_key_hash: '0x909bb549fa3d06c40ef7dbbafe0d19838d4c8024f94c352e27aaeec2dcedf690',
      data: {
        type: '0x1::account::Account',
        data: {
          authentication_key: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
          coin_register_events: {
            counter: '6',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '0',
              },
            },
          },
          guid_creation_num: '19',
          key_rotation_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '1',
              },
            },
          },
          rotation_capability_offer: {
            for: {
              vec: [],
            },
          },
          sequence_number: '24',
          signer_capability_offer: {
            for: {
              vec: [],
            },
          },
        },
      },
      type: 'write_resource',
    },
    {
      address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      state_key_hash: '0x9b9cc662dd91ed7ca91208cc659642ffbe16e7bafafbc5e98062a85b867c876d',
      data: {
        type: '0x1::coin::CoinStore<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          coin: {
            value: '42779473',
          },
          deposit_events: {
            counter: '181',
            guid: {
              id: {
                addr: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
                creation_num: '8',
              },
            },
          },
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
                creation_num: '9',
              },
            },
          },
        },
      },
      type: 'write_resource',
    },
    {
      state_key_hash: '0x7b6af779cb568ceab26c256848a7da4c1e32be96b445674bb23f4d895a137090',
      handle: '0x1ae3702f4b77f5422c21a1e821a3863a2bb05b13c6663ba3e5e325ad82973c0c',
      key: '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9',
      value:
        '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9ac4c20318e000000b81e85eb51b81e05000000000000000033333333333333b300000000000000002ec7f0639c5e030000000000d4fa950201000000000000005c8fc2f5285c8f020000000000000000f06527640000000070fd2d64000000000070c9b28b0000000060891c056003000000000000000000000000000000000000010000000000000005000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136000000000000000006000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136db0000000000000007000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      type: 'write_table_item',
    },
    {
      state_key_hash: '0x6e4b28d40f98a106a65163530924c0dcb40c1349d3aa915d108b4d6cfc1ddb19',
      handle: '0x1b854694ae746cdbd8d44186ca4929b2b337df21d1c74633be19b2710552fdca',
      key: '0x0619dc29a0aac8fa146714058e8dd6d2d0f3bdf5f6331907bf91f3acd81e6935',
      value: '0x0111df3e1bfc6c010000000000000000',
      type: 'write_table_item',
    },
  ],
  sender: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
  sequence_number: '23',
  max_gas_amount: '21796',
  gas_unit_price: '220',
  expiration_timestamp_secs: '1680391931',
  payload: {
    function: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136::lbp_scripts::swap_exact_in',
    type_arguments: [
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
    ],
    arguments: ['0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9', '20000000', '5777018785'],
    type: 'entry_function_payload',
  },
  signature: {
    public_key: '0xb9c9d2fc80b377d75d5b78d30cc2f0edb046a215c3e46444ed2ce66b0788ebff',
    signature:
      '0x5b9cd5d8ae0d100e956ec2d8a15844de0777b692985a61b7038b6a9d5c28e5ad03606f82760bf0fa6312697dfc2c56f47665d12ddfaf056d3e00583a8ed7840a',
    type: 'ed25519_signature',
  },
  events: [
    {
      guid: {
        creation_number: '16',
        account_address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      },
      sequence_number: '0',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '20000000',
      },
    },
    {
      guid: {
        creation_number: '8',
        account_address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      },
      sequence_number: '180',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '40000',
      },
    },
    {
      guid: {
        creation_number: '7',
        account_address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      },
      sequence_number: '218',
      type: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136::lbp::SwapEvent<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC, 0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL>',
      data: {
        amount_in: '20000000',
        amount_out: '5811069565',
        balance_0: '610709556396',
        balance_1: '948450714765102',
        creator_addr: '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9',
        fee_amount: '200000',
        is_buy: true,
        weight_0: {
          v: '2932309810243598415',
        },
        weight_1: {
          v: '15514434263465953201',
        },
      },
    },
    {
      guid: {
        creation_number: '0',
        account_address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      },
      sequence_number: '5',
      type: '0x1::account::CoinRegisterEvent',
      data: {
        type_info: {
          account_address: '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615',
          module_name: '0x74686c5f636f696e',
          struct_name: '0x54484c',
        },
      },
    },
    {
      guid: {
        creation_number: '17',
        account_address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      },
      sequence_number: '0',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '5811069565',
      },
    },
  ],
  timestamp: '1680391881111067',
  type: 'user_transaction',
}
