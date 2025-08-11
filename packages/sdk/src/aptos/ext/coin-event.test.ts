import { describe, test } from 'node:test'
import { findNewCoinBalances, getDepositCoinType, getWithDrawCoinType } from './coin-event.js'
import { expect } from 'chai'
import { TransactionResponseType, UserTransactionResponse } from '@aptos-labs/ts-sdk'

describe('resource change ', () => {
  test('withdraw usdc', () => {
    const evt = tx.events[0]
    const type = getWithDrawCoinType(evt, tx)
    expect(type).eq('0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC')
    const balance = findNewCoinBalances(
      evt,
      tx,
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'
    )
    expect(balance?.value).eq(103679210n)
  })

  test('deposit usdc', () => {
    const evt = tx.events[1]
    const type = getDepositCoinType(evt, tx)
    expect(type).eq('0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC')
    let balance = findNewCoinBalances(
      evt,
      tx,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance?.value).eq(undefined)
    balance = findNewCoinBalances(
      evt,
      tx,
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'
    )
    expect(balance?.value).eq(42779473n)
  })

  test('deposit thl', () => {
    const evt = tx.events[4]
    const type = getDepositCoinType(evt, tx)
    expect(type).eq('0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL')
    const balance = findNewCoinBalances(
      evt,
      tx,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance?.value).eq(5811069565n)
  })

  test('test tx2', () => {
    // let type
    // type = getWithDrawCoinType(tx2.events[0], tx2)
    // // type = getWithDrawCoinType(tx2.events[1], tx2)
    // // type = getDepositCoinType(tx2.events[3], tx2)
    // type = getDepositCoinType(tx2.events[4], tx2)
    // type = getDepositCoinType(tx2.events[5], tx2)
    // type = getDepositCoinType(tx2.events[8], tx2)

    // console.log(type)

    let balance
    balance = findNewCoinBalances(
      tx2.events[0],
      tx2,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance).eq(undefined)
    balance = findNewCoinBalances(
      tx2.events[1],
      tx2,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance).eq(undefined)
    balance = findNewCoinBalances(
      tx2.events[3],
      tx2,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance).eq(undefined)
    balance = findNewCoinBalances(
      tx2.events[4],
      tx2,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance).eq(undefined)
    balance = findNewCoinBalances(
      tx2.events[5],
      tx2,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance).eq(undefined)
  })

  test('test tx3', () => {
    const balance = findNewCoinBalances(
      tx3.events[0],
      tx3,
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    )
    expect(balance?.value).eq(0n)
  })
})

const tx: UserTransactionResponse = {
  version: '112145263',
  hash: '0xe8a9cc7e974ce2c0b737241f034e76dc03c6b6e2eea2deb3538ba9c5fa18c6c6',
  state_change_hash: '0xc8e8d9cebaf525d1a330cd68bfcff596e364f67df37ccb50a4ad2f5ce7855e36',
  event_root_hash: '0x419261b51b786ac315ada03ec34be32cf2187c4f5e8604fa71d6896b1a371108',
  state_checkpoint_hash: '0x0',
  replay_protection_nonce: '11',
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
            value: '508465811'
          },
          deposit_events: {
            counter: '5',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '2'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '20',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '3'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      state_key_hash: '0x0bf2b538b396fedbd1aa90cabfdc29ba93c466b0c110b5ffb81305aa6e82ef16',
      data: {
        type: '0x1::coin::CoinStore<0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL>',
        data: {
          coin: {
            value: '5811069565'
          },
          deposit_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '17'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '18'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
      state_key_hash: '0x43f2dc6124f3c13a30d716c0359d50246ecaec8376c9928e87d1bc8895e6b51e',
      data: {
        type: '0x1::coin::CoinStore<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          coin: {
            value: '103679210'
          },
          deposit_events: {
            counter: '2',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '15'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '16'
              }
            }
          }
        }
      },
      type: 'write_resource'
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
                creation_num: '0'
              }
            }
          },
          guid_creation_num: '19',
          key_rotation_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de',
                creation_num: '1'
              }
            }
          },
          rotation_capability_offer: {
            for: {
              vec: []
            }
          },
          sequence_number: '24',
          signer_capability_offer: {
            for: {
              vec: []
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      state_key_hash: '0x9b9cc662dd91ed7ca91208cc659642ffbe16e7bafafbc5e98062a85b867c876d',
      data: {
        type: '0x1::coin::CoinStore<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          coin: {
            value: '42779473'
          },
          deposit_events: {
            counter: '181',
            guid: {
              id: {
                addr: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
                creation_num: '8'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
                creation_num: '9'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      state_key_hash: '0x7b6af779cb568ceab26c256848a7da4c1e32be96b445674bb23f4d895a137090',
      handle: '0x1ae3702f4b77f5422c21a1e821a3863a2bb05b13c6663ba3e5e325ad82973c0c',
      key: '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9',
      value:
        '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9ac4c20318e000000b81e85eb51b81e05000000000000000033333333333333b300000000000000002ec7f0639c5e030000000000d4fa950201000000000000005c8fc2f5285c8f020000000000000000f06527640000000070fd2d64000000000070c9b28b0000000060891c056003000000000000000000000000000000000000010000000000000005000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136000000000000000006000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136db0000000000000007000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      type: 'write_table_item'
    },
    {
      state_key_hash: '0x6e4b28d40f98a106a65163530924c0dcb40c1349d3aa915d108b4d6cfc1ddb19',
      handle: '0x1b854694ae746cdbd8d44186ca4929b2b337df21d1c74633be19b2710552fdca',
      key: '0x0619dc29a0aac8fa146714058e8dd6d2d0f3bdf5f6331907bf91f3acd81e6935',
      value: '0x0111df3e1bfc6c010000000000000000',
      type: 'write_table_item'
    }
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
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
    ],
    arguments: ['0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9', '20000000', '5777018785'],
    type: 'entry_function_payload'
  },
  signature: {
    public_key: '0xb9c9d2fc80b377d75d5b78d30cc2f0edb046a215c3e46444ed2ce66b0788ebff',
    signature: 'ed25519_signature',
    // signature:
    //   '0x5b9cd5d8ae0d100e956ec2d8a15844de0777b692985a61b7038b6a9d5c28e5ad03606f82760bf0fa6312697dfc2c56f47665d12ddfaf056d3e00583a8ed7840a',
    type: 'ed25519_signature'
  },
  events: [
    {
      guid: {
        creation_number: '16',
        account_address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de'
      },
      sequence_number: '0',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '20000000'
      }
    },
    {
      guid: {
        creation_number: '8',
        account_address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136'
      },
      sequence_number: '180',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '40000'
      }
    },
    {
      guid: {
        creation_number: '7',
        account_address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136'
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
          v: '2932309810243598415'
        },
        weight_1: {
          v: '15514434263465953201'
        }
      }
    },
    {
      guid: {
        creation_number: '0',
        account_address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de'
      },
      sequence_number: '5',
      type: '0x1::account::CoinRegisterEvent',
      data: {
        type_info: {
          account_address: '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615',
          module_name: '0x74686c5f636f696e',
          struct_name: '0x54484c'
        }
      }
    },
    {
      guid: {
        creation_number: '17',
        account_address: '0x121d3f79798e75b04273f6364b8973e61e8fcab896a44f1e0914d97f4d36d6de'
      },
      sequence_number: '0',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '5811069565'
      }
    }
  ],
  timestamp: '1680391881111067',
  type: TransactionResponseType.User
}

const tx2: UserTransactionResponse = {
  sequence_number: '10',
  hash: '0x54ce83a3278c97dcea3854728333b7d6502acd11a42aa669b3260d0fe5ea6cad',
  state_root_hash: '',
  success: true,
  sender: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
  payload: {
    type: 'entry_function_payload',
    type_arguments: ['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'],
    arguments: [
      '110',
      '0x000000000000000000000000d2a7e100e1ab1206287cda30fe2ae7d97d9d0deb',
      '50000000',
      '25520823',
      '0',
      false,
      '0x0001000000000016e360',
      '0x'
    ],
    function: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::coin_bridge::send_coin_from'
  },
  gas_used: '8411',
  previous_block_votes: [],
  gas_unit_price: '200',
  timestamp: '1680236864637748',
  version: '111037488',
  event_root_hash: '0xcb5430c2581756eed1ca5484a4b0d98e01e36553195fcfd2945b8ea836939a7c',
  vm_status: 'Executed successfully',
  accumulator_root_hash: '0',
  proposer: '',
  round: '0',
  max_gas_amount: '16696',
  expiration_timestamp_secs: '1680236903',
  secondary_signers: [],
  type: 'user_transaction',
  changes: [
    {
      data: {
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          coin: { value: '1393131408554' },
          deposit_events: {
            counter: '105022',
            guid: {
              id: {
                addr: '0x12e12de0af996d9611b0b78928cd9f4cbf50d94d972043cdd829baa77a78929b',
                creation_num: '2'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                creation_num: '3',
                addr: '0x12e12de0af996d9611b0b78928cd9f4cbf50d94d972043cdd829baa77a78929b'
              }
            }
          }
        },
        key: '',
        value: '',
        bytecode: '',
        abi: null
      },
      type: 'write_resource',
      state_key_hash: '0x31ee1f242c010b8df72caafdb881c3122a11f3b42c852903a6b183e94d7fb4dd',
      address: '0x12e12de0af996d9611b0b78928cd9f4cbf50d94d972043cdd829baa77a78929b',
      module: '',
      resource: ''
    },
    {
      data: {
        key: '',
        value: '',
        bytecode: '',
        abi: null,
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          coin: { value: '1544195755945' },
          deposit_events: {
            counter: '210239',
            guid: {
              id: {
                creation_num: '2',
                addr: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '236274',
            guid: {
              id: {
                addr: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4',
                creation_num: '3'
              }
            }
          }
        }
      },
      type: 'write_resource',
      state_key_hash: '0x0de63635040df012ebc7d954c75e4974e0f58e8aed13aa66122b408ca038e82d',
      address: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4',
      module: '',
      resource: ''
    },
    {
      state_key_hash: '0x6456027d9e174457399361c5e6bf700489b6c85dada6c0a4eadf25cfe42cd1bd',
      address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
      module: '',
      resource: '',
      data: {
        handle: '',
        key: '',
        value: '',
        bytecode: '',
        abi: null,
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '3'
              }
            }
          },
          coin: { value: '9985597700' },
          deposit_events: {
            counter: '105024',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '2'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      type: 'write_resource',
      state_key_hash: '0x11fa2567d223b675f2f65a376d63b8405a0deb5da0fba64e9f5712910ebff333',
      address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
      module: '',
      resource: '',
      data: {
        key: '',
        value: '',
        bytecode: '',
        abi: null,
        type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::channel::EventStore',
        data: {
          inbound_events: {
            counter: '239866',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '4'
              }
            }
          },
          outbound_events: {
            counter: '105022',
            guid: {
              id: {
                creation_num: '5',
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
              }
            }
          },
          receive_events: {
            counter: '239916',
            guid: {
              id: {
                creation_num: '6',
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
              }
            }
          }
        },
        handle: ''
      }
    },
    {
      data: {
        bytecode: '',
        abi: null,
        type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::executor_v1::EventStore',
        data: {
          airdrop_events: {
            counter: '236084',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '12'
              }
            }
          },
          request_events: {
            counter: '105022',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '11'
              }
            }
          }
        },
        handle: '',
        key: ''
      },
      type: 'write_resource',
      state_key_hash: '0xa3f556bdcaf77155b8b3dced1707f9713eedf03a48e96bc2f66341f10e0f71b4',
      address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
      module: '',
      resource: ''
    },
    {
      type: 'write_resource',
      state_key_hash: '0xa64be437fdc2629ade52a3200b2913f55d8736f5ea4c9269fdf3720d37cbcf07',
      address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
      module: '',
      resource: '',
      data: {
        abi: null,
        type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::msglib_v1_0::GlobalStore',
        data: {
          outbound_events: {
            counter: '105022',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '9'
              }
            }
          },
          treasury_fee_bps: 0
        },
        handle: '',
        key: '',
        value: ''
      }
    },
    {
      address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
      module: '',
      resource: '',
      data: {
        abi: null,
        type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::packet_event::EventStore',
        data: {
          outbound_events: {
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '8'
              }
            },
            counter: '105022'
          },
          inbound_events: {
            counter: '239916',
            guid: {
              id: {
                addr: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90',
                creation_num: '7'
              }
            }
          }
        },
        handle: '',
        key: ''
      },
      type: 'write_resource',
      state_key_hash: '0xf76bf20e68b4724ba1c758d4557661de33c8f96681e8f700cbcc6e5a727a63c1'
    },
    {
      address: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
      module: '',
      resource: '',
      data: {
        abi: null,
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          deposit_events: {
            guid: {
              id: {
                addr: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
                creation_num: '2'
              }
            },
            counter: '6'
          },
          frozen: false,
          withdraw_events: {
            counter: '10',
            guid: {
              id: {
                addr: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
                creation_num: '3'
              }
            }
          },
          coin: { value: '81201559' }
        },
        handle: '',
        key: ''
      },
      type: 'write_resource',
      state_key_hash: '0xb687b62365b887ed9118ce992bfad45e8e77eaede57973b7212797007879e446'
    },
    {
      type: 'write_resource',
      state_key_hash: '0x0bdfead879d41c9e0fc8d76299df40eb7becc2534240298c5d7a4291fe2f01c1',
      address: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
      module: '',
      resource: '',
      data: {
        abi: null,
        type: '0x1::coin::CoinStore<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          coin: { value: '0' },
          deposit_events: {
            guid: {
              id: {
                addr: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
                creation_num: '12'
              }
            },
            counter: '1'
          },
          frozen: false,
          withdraw_events: {
            guid: {
              id: {
                creation_num: '13',
                addr: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed'
              }
            },
            counter: '1'
          }
        },
        handle: ''
      }
    },
    {
      type: 'write_resource',
      state_key_hash: '0xe99f46d5b29b64245b6294c438cf54dda32b3b59dfc62e0dff2c5ad806990e10',
      address: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
      module: '',
      resource: '',
      data: {
        abi: null,
        type: '0x1::account::Account',
        data: {
          signer_capability_offer: { for: { vec: [] } },
          authentication_key: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
          coin_register_events: {
            counter: '3',
            guid: {
              id: {
                addr: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
                creation_num: '0'
              }
            }
          },
          guid_creation_num: '14',
          key_rotation_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed',
                creation_num: '1'
              }
            }
          },
          rotation_capability_offer: { for: { vec: [] } },
          sequence_number: '11'
        },
        handle: '',
        key: '',
        value: '',
        bytecode: ''
      }
    },
    {
      module: '',
      resource: '',
      data: {
        handle: '',
        key: '',
        value: '',
        bytecode: '',
        abi: null,
        type: '0x1::coin::CoinInfo<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          supply: {
            vec: [
              {
                aggregator: { vec: [] },
                integer: { vec: [{ limit: '340282366920938463463374607431768211455', value: '14323584217036' }] }
              }
            ]
          },
          symbol: 'USDC',
          decimals: 6,
          name: 'USD Coin'
        }
      },
      type: 'write_resource',
      state_key_hash: '0xb2c6ac0fb290adcc000aa3dabb872c3d702d9db5ffcd79f0372c468d66b9ad75',
      address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa'
    },
    {
      type: 'write_resource',
      state_key_hash: '0x354b9f98f9b9ec4daef12a12cf7a90fba0835e0217e619d9842c10a5a7a1f5e7',
      address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
      module: '',
      resource: '',
      data: {
        handle: '',
        key: '',
        value: '',
        bytecode: '',
        abi: null,
        type: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::limiter::Limiter<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          cap_sd: '3000000000000',
          enabled: true,
          sum_sd: '367816956728',
          t0_sec: '1680230642',
          window_sec: '86400'
        }
      }
    },
    {
      type: 'write_resource',
      state_key_hash: '0xd4044c0f6183e29c9b0eac374056cee14aa5c239b811be978df8e9454d58cc94',
      address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
      module: '',
      resource: '',
      data: {
        value: '',
        bytecode: '',
        abi: null,
        type: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::coin_bridge::EventStore',
        data: {
          claim_events: {
            counter: '40964',
            guid: {
              id: {
                addr: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
                creation_num: '6'
              }
            }
          },
          receive_events: {
            counter: '228722',
            guid: {
              id: {
                creation_num: '5',
                addr: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa'
              }
            }
          },
          send_events: {
            guid: {
              id: {
                addr: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
                creation_num: '4'
              }
            },
            counter: '98345'
          }
        },
        handle: '',
        key: ''
      }
    },
    {
      type: 'write_table_item',
      state_key_hash: '0x6e4b28d40f98a106a65163530924c0dcb40c1349d3aa915d108b4d6cfc1ddb19',
      address: '',
      module: '',
      resource: '',
      data: { key: '', value: '', bytecode: '', abi: null, type: '', data: null, handle: '' }
    },
    {
      type: 'write_table_item',
      state_key_hash: '0x06cb6cf2f040035431f6525cb9d0243dbf1070ac129efaa868d53f5fb213f426',
      address: '',
      module: '',
      resource: '',
      data: { data: null, handle: '', key: '', value: '', bytecode: '', abi: null, type: '' }
    },
    {
      type: 'write_table_item',
      state_key_hash: '0xd0e374e4d7ffad287513f63e19a347f8d1f147d1294a6b1dd01f207bc734247e',
      address: '',
      module: '',
      resource: '',
      data: { abi: null, type: '', data: null, handle: '', key: '', value: '', bytecode: '' }
    }
  ],
  id: '',
  events: [
    {
      guid: {
        creation_number: '13',
        account_address: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed'
      },
      sequence_number: '0',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '50000000'
      }
    },
    {
      guid: {
        creation_number: '3',
        account_address: '0x8d52b9746754dda43977e88b7b57fd761ec33df0f8cb4b275fee7b93d64719ed'
      },
      sequence_number: '9',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '25520823'
      }
    },
    {
      guid: {
        creation_number: '5',
        account_address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
      },
      sequence_number: '105021',
      type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::channel::MsgEvent',
      data: {
        local_address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
        nonce: '39416',
        remote_address: '0x1bacc2205312534375c8d1801c27d28370656cff',
        remote_chain_id: '110'
      }
    },
    {
      guid: {
        creation_number: '2',
        account_address: '0x12e12de0af996d9611b0b78928cd9f4cbf50d94d972043cdd829baa77a78929b'
      },
      sequence_number: '105021',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '11292750'
      }
    },
    {
      guid: {
        creation_number: '2',
        account_address: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4'
      },
      sequence_number: '210237',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '11558073'
      }
    },
    {
      guid: {
        creation_number: '2',
        account_address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
      },
      sequence_number: '105023',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '0'
      }
    },
    {
      guid: {
        creation_number: '9',
        account_address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
      },
      sequence_number: '105021',
      type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::msglib_v1_0::UlnEvent',
      data: {
        uln_config: {
          inbound_confirmations: '20',
          oracle: '0x12e12de0af996d9611b0b78928cd9f4cbf50d94d972043cdd829baa77a78929b',
          outbound_confirmations: '500000',
          relayer: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4'
        }
      }
    },
    {
      guid: {
        creation_number: '8',
        account_address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
      },
      sequence_number: '105021',
      type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::packet_event::OutboundEvent',
      data: {
        encoded_packet:
          '0x00000000000099f8006cf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa006e1bacc2205312534375c8d1801c27d28370656cff01000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000d2a7e100e1ab1206287cda30fe2ae7d97d9d0deb0000000002faf08000'
      }
    },
    {
      guid: {
        creation_number: '2',
        account_address: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4'
      },
      sequence_number: '210238',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '2670000'
      }
    },
    {
      guid: {
        creation_number: '11',
        account_address: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90'
      },
      sequence_number: '105021',
      type: '0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90::executor_v1::RequestEvent',
      data: {
        adapter_params: '0x0001000000000016e360',
        executor: '0x1d8727df513fa2a8785d0834e40b34223daff1affc079574082baadb74b66ee4',
        guid: '0x0e3356f5b8e3a70178fb19bd2eda2ad2796692fd53d31a4b9b663982a3bbecd0'
      }
    },
    {
      guid: {
        creation_number: '4',
        account_address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa'
      },
      sequence_number: '98344',
      type: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::coin_bridge::SendEvent',
      data: {
        amount_ld: '50000000',
        coin_type: {
          account_address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
          module_name: '0x6173736574',
          struct_name: '0x55534443'
        },
        dst_chain_id: '110',
        dst_receiver: '0x000000000000000000000000d2a7e100e1ab1206287cda30fe2ae7d97d9d0deb',
        unwrap: false
      }
    }
  ]
} as any

const tx3: UserTransactionResponse = {
  version: '111523396',
  hash: '0x86a58499f43b357e74060c4f29eca1cb84287558a58cfcfd8c5354678955b37d',
  state_change_hash: '0x1c0dfabf2396b0ce8c460071bccfc688101709ffc13039232046c09cf06ec18b',
  event_root_hash: '0x4d1baf46187de8bb0154298d43767b5b5d90eeca8b54c8facfdc07f09f5caa1d',
  state_checkpoint_hash: null,
  gas_used: '10063',
  success: true,
  vm_status: 'Executed successfully',
  accumulator_root_hash: '0x300de1c907c241a5063959fb97ed95c133fa4186f387e42d47fae76626e663ad',
  changes: [
    {
      address: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
      state_key_hash: '0x08020b6fd16c7d49c07107f9254d2b83b8363effe5b9b21768f4771e17428203',
      data: {
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          coin: {
            value: '123738600'
          },
          deposit_events: {
            counter: '4',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '2'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '3'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
      state_key_hash: '0xf3595bd2639058e013ad85d9b726c230784cabad4d0ec68c100b523f5280fa0c',
      data: {
        type: '0x1::coin::CoinStore<0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL>',
        data: {
          coin: {
            value: '0'
          },
          deposit_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '10'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '11'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
      state_key_hash: '0x649b8fd2ffef632d6a73cd5eec2ed2af3fcd448df8a700b268ca46ea72d182c1',
      data: {
        type: '0x1::coin::CoinStore<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        data: {
          coin: {
            value: '8253916694'
          },
          deposit_events: {
            counter: '4',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '8'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '1',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '9'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
      state_key_hash: '0x500ececa30c7cdb4db8e3b176191c1dc98b92c43373a1a99f5fbbcd7f4ed0f6a',
      data: {
        type: '0x1::account::Account',
        data: {
          authentication_key: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
          coin_register_events: {
            counter: '5',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '0'
              }
            }
          },
          guid_creation_num: '12',
          key_rotation_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
                creation_num: '1'
              }
            }
          },
          rotation_capability_offer: {
            for: {
              vec: []
            }
          },
          sequence_number: '4',
          signer_capability_offer: {
            for: {
              vec: []
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      state_key_hash: '0xc677f04f18b95c4870a74bb15a8fb7c202ed6a8578a5c6041550d985046237e2',
      data: {
        type: '0x1::coin::CoinStore<0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL>',
        data: {
          coin: {
            value: '592092570'
          },
          deposit_events: {
            counter: '4',
            guid: {
              id: {
                addr: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
                creation_num: '10'
              }
            }
          },
          frozen: false,
          withdraw_events: {
            counter: '0',
            guid: {
              id: {
                addr: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
                creation_num: '11'
              }
            }
          }
        }
      },
      type: 'write_resource'
    },
    {
      state_key_hash: '0x7b6af779cb568ceab26c256848a7da4c1e32be96b445674bb23f4d895a137090',
      handle: '0x1ae3702f4b77f5422c21a1e821a3863a2bb05b13c6663ba3e5e325ad82973c0c',
      key: '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9',
      value:
        '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9d1b125288c000000b81e85eb51b81e05000000000000000033333333333333b30000000000000000b1a93c49fb5f030000000000d4fa950201000000000000005c8fc2f5285c8f020000000000000000f06527640000000070fd2d64000000000070c9b28b0000000060891c056003000000000000000000000000000000000000010000000000000005000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136000000000000000006000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136100000000000000007000000000000006970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136',
      data: null,
      type: 'write_table_item'
    },
    {
      state_key_hash: '0x6e4b28d40f98a106a65163530924c0dcb40c1349d3aa915d108b4d6cfc1ddb19',
      handle: '0x1b854694ae746cdbd8d44186ca4929b2b337df21d1c74633be19b2710552fdca',
      key: '0x0619dc29a0aac8fa146714058e8dd6d2d0f3bdf5f6331907bf91f3acd81e6935',
      value: '0xe8457eeb26ec6c010000000000000000',
      data: null,
      type: 'write_table_item'
    }
  ],
  sender: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e',
  sequence_number: '3',
  max_gas_amount: '20082',
  gas_unit_price: '200',
  expiration_timestamp_secs: '1680304437',
  payload: {
    function: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136::lbp_scripts::swap_exact_in',
    type_arguments: [
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
      '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'
    ],
    arguments: ['0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9', '283433368837', '5757212276'],
    type: 'entry_function_payload'
  },
  signature: {
    public_key: '0x8df225f875235cb64ab18063da5af13cc80c5bb79fad4016c3e717eea76d89bd',
    signature:
      '0x5f7c131a1a6c297d45756c64e5b3944a8405f0574c569c7562012a8eb680bf14cbf995fc4c538cd1cef1cbf5ba9c5a1e1e7fef9d4613f780d13ce38443939c03',
    type: 'ed25519_signature'
  },
  events: [
    {
      guid: {
        creation_number: '11',
        account_address: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e'
      },
      sequence_number: '0',
      type: '0x1::coin::WithdrawEvent',
      data: {
        amount: '283433368837'
      }
    },
    {
      guid: {
        creation_number: '10',
        account_address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136'
      },
      sequence_number: '3',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '566866738'
      }
    },
    {
      guid: {
        creation_number: '7',
        account_address: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136'
      },
      sequence_number: '15',
      type: '0x6970b4878c3aea96732be3f31c2dded12d94d9455ff0c76c67d84859dce35136::lbp::SwapEvent<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC, 0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL>',
      data: {
        amount_in: '283433368837',
        amount_out: '8253916694',
        balance_0: '601968980433',
        balance_1: '949957800274353',
        creator_addr: '0x4dcae85fc5559071906cd5c76b7420fcbb4b0a92f00ab40ffc394aadbbff5ee9',
        fee_amount: '2834333688',
        is_buy: false,
        weight_0: {
          v: '391670493545038053'
        },
        weight_1: {
          v: '18055073580164513563'
        }
      }
    },
    {
      guid: {
        creation_number: '8',
        account_address: '0x198e51d10144600bec455c2ea10dfb924259b5f7241c39e27162b1dc20c1988e'
      },
      sequence_number: '3',
      type: '0x1::coin::DepositEvent',
      data: {
        amount: '8253916694'
      }
    }
  ],
  timestamp: '1680304383017796',
  type: 'user_transaction'
} as any
