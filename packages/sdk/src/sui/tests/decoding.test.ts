import { defaultMoveCoder } from '../move-coder.js'
import { dynamic_field, loadAllTypes } from '../builtin/0x2.js'
import { expect } from 'chai'
import { TypedSuiMoveObject } from '../models.js'
import { SuiNetwork } from '../network.js'
import { parseMoveType } from '../../move/index.js'

describe('Test Sui Example', () => {
  const coder = defaultMoveCoder(SuiNetwork.TEST_NET)
  loadAllTypes(coder)

  test('decode object', async () => {
    const data = {
      type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::Info',
      fields: {
        create_ts_ms: '1680756795894',
        creator: '0xb6c7e3b1c61ee81516a8317f221daa035f1503e0ac3ae7a50b61834bc7a3ead9',
        delivery_info: {
          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::DeliveryInfo',
          fields: {
            premium: '0',
            price: '603716059',
            round: '11',
            size: '0',
            ts_ms: '1681635628133',
          },
        },
        index: '11',
        round: '11',
      },
    }
    const res = await coder.decode(
      data,
      parseMoveType(
        '0x1::option::Option<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::Info>'
      )
    )
    console.log(res)
  })

  test('decode object2', async () => {
    const data = {
      type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::BidVault<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::ManagerCap, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
      fields: {
        bidder_sub_vault: {
          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
          fields: {
            balance: '0',
            index: '11',
            share_supply: '0',
            tag: '4',
            user_shares: {
              type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
              fields: {
                first: null,
                id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                last: null,
                length: '0',
              },
            },
          },
        },
        performance_fee_sub_vault: {
          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
          fields: {
            balance: '0',
            index: '11',
            share_supply: '0',
            tag: '6',
            user_shares: {
              type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
              fields: {
                first: null,
                id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                last: null,
                length: '0',
              },
            },
          },
        },
        premium_sub_vault: {
          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
          fields: {
            balance: '0',
            index: '11',
            share_supply: '0',
            tag: '5',
            user_shares: {
              type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
              fields: {
                first: null,
                id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                last: null,
                length: '0',
              },
            },
          },
        },
      },
    }
    const res = await coder.decode(data, parseMoveType(data.type))
    console.log(res)
  })

  test('decode dynamic fields', async () => {
    const objects = data.map((d) => d.data.content)
    const res: TypedSuiMoveObject<dynamic_field.Field<string, boolean>>[] = await coder.filterAndDecodeObjects(
      '0x2::dynamic_field::Field<address, bool>',
      objects
    )
    expect(res.length).eq(objects.length)

    const decodedObjects = await coder.getDynamicFields(objects, 'address', 'bool')
    expect(res.length).eq(decodedObjects.length)
    console.log(decodedObjects)
  })

  test('decode dynamic fields 2', async () => {
    const objects = data2.map((d) => d.data.content)
    const res: TypedSuiMoveObject<dynamic_field.Field<any, any>>[] = await coder.filterAndDecodeObjects(
      '0x2::dynamic_field::Field',
      objects
    )
    expect(res.length).eq(objects.length)

    const decodedObjects = await coder.getDynamicFields(
      objects,
      'u64',
      '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PortfolioVault'
    )
    expect(res.length).eq(1)
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

const data2 = [
  {
    data: {
      objectId: '0x0b96ca4b33fef52a7a8e7575e5caeb6bb482a480c9c089d763c6664cd802ddea',
      version: '6201683',
      digest: 'HHvMjfPCYq3DyxEoiAw6HgiLLAqz2vGY1HdkdTvPJrnR',
      type: '0x2::dynamic_field::Field<u64, 0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PortfolioVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::sui::SUI>>',
      owner: {
        ObjectOwner: '0xdcb1f0c4d31528a67f89303e3a99e15b9e21c7e22b4123a0e43e90b3fae5ea1e',
      },
      content: {
        dataType: 'moveObject',
        type: '0x2::dynamic_field::Field<u64, 0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PortfolioVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::sui::SUI>>',
        hasPublicTransfer: false,
        fields: {
          id: {
            id: '0x0b96ca4b33fef52a7a8e7575e5caeb6bb482a480c9c089d763c6664cd802ddea',
          },
          name: '11',
          value: {
            type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PortfolioVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::sui::SUI>',
            fields: {
              auction: null,
              authority: {
                type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::authority::Authority<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::ManagerCap>',
                fields: {
                  whitelist: {
                    type: '0x2::linked_table::LinkedTable<address, bool>',
                    fields: {
                      head: '0xb6c7e3b1c61ee81516a8317f221daa035f1503e0ac3ae7a50b61834bc7a3ead9',
                      id: {
                        id: '0x40decd3eb4eedc3c5065f14e7b865e143a0736a5614f8062476aade3a2b931a3',
                      },
                      size: '1',
                      tail: '0xb6c7e3b1c61ee81516a8317f221daa035f1503e0ac3ae7a50b61834bc7a3ead9',
                    },
                  },
                },
              },
              bid_vault: {
                type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::BidVault<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::ManagerCap, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                fields: {
                  bidder_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '4',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                  performance_fee_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '6',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                  premium_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '5',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                },
              },
              config: {
                type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::Config',
                fields: {
                  activation_ts_ms: '1681632000000',
                  active_vault_config: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::VaultConfig',
                    fields: {
                      auction_duration_in_ms: '3600000',
                      decay_speed: '1',
                      final_price: '388759141',
                      initial_price: '603716059',
                      payoff_configs: [
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: false,
                            strike: '1380000000',
                            strike_pct: '10983',
                            weight: '1',
                          },
                        },
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: true,
                            strike: '1260000000',
                            strike_pct: '10000',
                            weight: '2',
                          },
                        },
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: false,
                            strike: '1140000000',
                            strike_pct: '9016',
                            weight: '1',
                          },
                        },
                      ],
                      strike_increment: '10000000',
                    },
                  },
                  b_token_decimal: '9',
                  capacity: '100000000000000',
                  d_token_decimal: '9',
                  expiration_ts_ms: '1681718400000',
                  has_next: true,
                  leverage: '100',
                  lot_size: '100000',
                  o_token_decimal: '9',
                  option_type: '5',
                  period: '0',
                  upcoming_vault_config: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::VaultConfig',
                    fields: {
                      auction_duration_in_ms: '3600000',
                      decay_speed: '1',
                      final_price: '388759141',
                      initial_price: '603716059',
                      payoff_configs: [
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: false,
                            strike: null,
                            strike_pct: '10983',
                            weight: '1',
                          },
                        },
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: true,
                            strike: null,
                            strike_pct: '10000',
                            weight: '2',
                          },
                        },
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: false,
                            strike: null,
                            strike_pct: '9016',
                            weight: '1',
                          },
                        },
                      ],
                      strike_increment: '10000000',
                    },
                  },
                  warmup_vault_config: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::VaultConfig',
                    fields: {
                      auction_duration_in_ms: '3600000',
                      decay_speed: '1',
                      final_price: '388759141',
                      initial_price: '603716059',
                      payoff_configs: [
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: false,
                            strike: null,
                            strike_pct: '10983',
                            weight: '1',
                          },
                        },
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: true,
                            strike: null,
                            strike_pct: '10000',
                            weight: '2',
                          },
                        },
                        {
                          type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::PayoffConfig',
                          fields: {
                            is_buyer: false,
                            strike: null,
                            strike_pct: '9016',
                            weight: '1',
                          },
                        },
                      ],
                      strike_increment: '10000000',
                    },
                  },
                },
              },
              deposit_vault: {
                type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::DepositVault<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::ManagerCap, 0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                fields: {
                  active_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '0',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                  deactivating_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '1',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                  has_next: true,
                  inactive_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '2',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                  warmup_sub_vault: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::SubVault<0xd175cff04f1d49574efb6f138bc3b9b7313915a57b5ca04141fb1cb4f66984b2::usdc::USDC>',
                    fields: {
                      balance: '0',
                      index: '11',
                      share_supply: '0',
                      tag: '3',
                      user_shares: {
                        type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::linked_list::LinkedList<0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::vault::UserShareKey, u64>',
                        fields: {
                          first: null,
                          id: '0xbc2092c8ddddfc1e1bd850879b8e16e4c504fd060d0d2e7e9a5a83117b59a953',
                          last: null,
                          length: '0',
                        },
                      },
                    },
                  },
                },
              },
              info: {
                type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::Info',
                fields: {
                  create_ts_ms: '1680756795894',
                  creator: '0xb6c7e3b1c61ee81516a8317f221daa035f1503e0ac3ae7a50b61834bc7a3ead9',
                  delivery_info: {
                    type: '0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2::single_collateral::DeliveryInfo',
                    fields: {
                      premium: '0',
                      price: '603716059',
                      round: '11',
                      size: '0',
                      ts_ms: '1681635628133',
                    },
                  },
                  index: '11',
                  round: '11',
                },
              },
            },
          },
        },
      },
    },
  },
  // {
  //   "data": {
  //     "objectId": "0x0002cd71bdbcd593ac8558cb9ae5ddd7df08861671ce8a50656a5380ce200094",
  //     "version": "284842",
  //     "digest": "3eEgWLdREioWdyhArwq8sRQmYhheQyUJZWzGMiurk59T",
  //     "type": "0x2::dynamic_field::Field<address, bool>",
  //     "owner": {
  //       "ObjectOwner": "0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c"
  //     },
  //     "content": {
  //       "dataType": "moveObject",
  //       "type": "0x2::dynamic_field::Field<address, bool>",
  //       "hasPublicTransfer": false,
  //       "fields": {
  //         "id": {
  //           "id": "0x0002cd71bdbcd593ac8558cb9ae5ddd7df08861671ce8a50656a5380ce200094"
  //         },
  //         "name": "0x641a3ae10ac6df38503ddf28f41ef7ed2cf90c8a9ec3db156de4f7b36f9876eb",
  //         "value": true
  //       }
  //     }
  //   }
  // },
  // {
  //   "data": {
  //     "objectId": "0x001030edc1453fd6a81af482c881d328890c0544b5756c989f17f326595161dc",
  //     "version": "293745",
  //     "digest": "J5sByqHXemu6y8dPjLmW1Uu26T2Ty17UsM6zhRxhDUY8",
  //     "type": "0x2::dynamic_field::Field<address, bool>",
  //     "owner": {
  //       "ObjectOwner": "0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c"
  //     },
  //     "content": {
  //       "dataType": "moveObject",
  //       "type": "0x2::dynamic_field::Field<address, bool>",
  //       "hasPublicTransfer": false,
  //       "fields": {
  //         "id": {
  //           "id": "0x001030edc1453fd6a81af482c881d328890c0544b5756c989f17f326595161dc"
  //         },
  //         "name": "0x1ca3775163688720ba837ea455a05c70b9e15d4c8f3aaa512c8211fb029f1bde",
  //         "value": true
  //       }
  //     }
  //   }
  // }
]
