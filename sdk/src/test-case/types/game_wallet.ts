export const game_wallet_idl = {
  "version": "0.1.0",
  "name": "game_wallet",
  "instructions": [
    {
      "name": "initializeTokenConfig",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenDecimal",
          "type": "u8"
        },
        {
          "name": "isPaused",
          "type": "bool"
        },
        {
          "name": "canDeposit",
          "type": "bool"
        },
        {
          "name": "canWithdraw",
          "type": "bool"
        },
        {
          "name": "canSpend",
          "type": "bool"
        },
        {
          "name": "canDistribute",
          "type": "bool"
        },
        {
          "name": "isWithdrawServiceFeeEnable",
          "type": "bool"
        },
        {
          "name": "withdrawServiceFeePercentage",
          "type": "u64"
        },
        {
          "name": "isSpendServiceFeeEnable",
          "type": "bool"
        },
        {
          "name": "spendServiceFeePercentage",
          "type": "u64"
        },
        {
          "name": "isDistributionServiceFeeEnable",
          "type": "bool"
        },
        {
          "name": "distributionServiceFeePercentage",
          "type": "u64"
        },
        {
          "name": "isMinWithdrawEnable",
          "type": "bool"
        },
        {
          "name": "isMaxWithdrawEnable",
          "type": "bool"
        },
        {
          "name": "minWithdraw",
          "type": "u64"
        },
        {
          "name": "maxWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "depositFor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositForTokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "depositPoolBump",
          "type": "u8"
        },
        {
          "name": "depositPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiverTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "depositPoolBump",
          "type": "u8"
        },
        {
          "name": "depositPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "userTokenConfigBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "nonce",
          "type": "i64"
        }
      ]
    },
    {
      "name": "spend",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "depositPoolBump",
          "type": "u8"
        },
        {
          "name": "depositPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "userTokenConfigBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "nonce",
          "type": "i64"
        }
      ]
    },
    {
      "name": "spendWithoutUser",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "depositPoolBump",
          "type": "u8"
        },
        {
          "name": "depositPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "userTokenConfigBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "nonce",
          "type": "i64"
        }
      ]
    },
    {
      "name": "addDistributeSupply",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "distributionPoolBump",
          "type": "u8"
        },
        {
          "name": "distributionPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distribute",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "depositPoolBump",
          "type": "u8"
        },
        {
          "name": "depositPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "distributionPoolBump",
          "type": "u8"
        },
        {
          "name": "distributionPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "nonce",
          "type": "i64"
        }
      ]
    },
    {
      "name": "distributeWithoutUser",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "depositPoolBump",
          "type": "u8"
        },
        {
          "name": "depositPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "distributionPoolBump",
          "type": "u8"
        },
        {
          "name": "distributionPoolTokenAccountBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "nonce",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateTokenConfig",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "incomeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "incomeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "tokenDecimal",
          "type": "u8"
        },
        {
          "name": "isPaused",
          "type": "bool"
        },
        {
          "name": "canDeposit",
          "type": "bool"
        },
        {
          "name": "canWithdraw",
          "type": "bool"
        },
        {
          "name": "canSpend",
          "type": "bool"
        },
        {
          "name": "canDistribute",
          "type": "bool"
        },
        {
          "name": "isWithdrawServiceFeeEnable",
          "type": "bool"
        },
        {
          "name": "withdrawServiceFeePercentage",
          "type": "u64"
        },
        {
          "name": "isSpendServiceFeeEnable",
          "type": "bool"
        },
        {
          "name": "spendServiceFeePercentage",
          "type": "u64"
        },
        {
          "name": "isDistributionServiceFeeEnable",
          "type": "bool"
        },
        {
          "name": "distributionServiceFeePercentage",
          "type": "u64"
        },
        {
          "name": "isMinWithdrawEnable",
          "type": "bool"
        },
        {
          "name": "isMaxWithdrawEnable",
          "type": "bool"
        },
        {
          "name": "minWithdraw",
          "type": "u64"
        },
        {
          "name": "maxWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateUserTokenConfig",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signingAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenConfig",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenConfigBump",
          "type": "u8"
        },
        {
          "name": "userTokenConfigBump",
          "type": "u8"
        },
        {
          "name": "isActive",
          "type": "bool"
        },
        {
          "name": "canDeposit",
          "type": "bool"
        },
        {
          "name": "canWithdraw",
          "type": "bool"
        },
        {
          "name": "canSpend",
          "type": "bool"
        },
        {
          "name": "canDistribute",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "DepositPoolAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "currentValue",
            "type": "u64"
          },
          {
            "name": "totalValue",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DistributionPoolAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "currentValue",
            "type": "u64"
          },
          {
            "name": "totalValue",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TokenConfigAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signingAuthority",
            "type": "publicKey"
          },
          {
            "name": "tokenMintAccount",
            "type": "publicKey"
          },
          {
            "name": "tokenDecimal",
            "type": "u8"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "canDeposit",
            "type": "bool"
          },
          {
            "name": "canWithdraw",
            "type": "bool"
          },
          {
            "name": "canSpend",
            "type": "bool"
          },
          {
            "name": "canDistribute",
            "type": "bool"
          },
          {
            "name": "isWithdrawServiceFeeEnable",
            "type": "bool"
          },
          {
            "name": "withdrawServiceFeePercentage",
            "type": "u64"
          },
          {
            "name": "isSpendServiceFeeEnable",
            "type": "bool"
          },
          {
            "name": "spendServiceFeePercentage",
            "type": "u64"
          },
          {
            "name": "isDistributionServiceFeeEnable",
            "type": "bool"
          },
          {
            "name": "distributionServiceFeePercentage",
            "type": "u64"
          },
          {
            "name": "isMinWithdrawEnable",
            "type": "bool"
          },
          {
            "name": "isMaxWithdrawEnable",
            "type": "bool"
          },
          {
            "name": "minWithdraw",
            "type": "u64"
          },
          {
            "name": "maxWithdraw",
            "type": "u64"
          },
          {
            "name": "depositPool",
            "type": "publicKey"
          },
          {
            "name": "incomeAccount",
            "type": "publicKey"
          },
          {
            "name": "distributionPool",
            "type": "publicKey"
          },
          {
            "name": "lastUsedBlockTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UserTokenConfigAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "currentValue",
            "type": "u64"
          },
          {
            "name": "totalDepositValue",
            "type": "u64"
          },
          {
            "name": "totalWithdrawValue",
            "type": "u64"
          },
          {
            "name": "totalSpendValue",
            "type": "u64"
          },
          {
            "name": "totalDistributeValue",
            "type": "u64"
          },
          {
            "name": "totalServiceFeeValue",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "canDeposit",
            "type": "bool"
          },
          {
            "name": "canWithdraw",
            "type": "bool"
          },
          {
            "name": "canSpend",
            "type": "bool"
          },
          {
            "name": "canDistribute",
            "type": "bool"
          },
          {
            "name": "lastUsedBlockTimestamp",
            "type": "i64"
          },
          {
            "name": "lastGameAction",
            "type": {
              "defined": "GameAction"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Deposit"
          },
          {
            "name": "Withdraw"
          },
          {
            "name": "Spend"
          },
          {
            "name": "Distribute"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSigningAuthority",
      "msg": "Invalid Signing Authority"
    },
    {
      "code": 6001,
      "name": "InvalidIncomeAccount",
      "msg": "Invalid Income Account"
    },
    {
      "code": 6002,
      "name": "Paused",
      "msg": "Paused"
    },
    {
      "code": 6003,
      "name": "InvalidWithdrawServiceFee",
      "msg": "Invalid Withdraw Service Fee"
    },
    {
      "code": 6004,
      "name": "InvalidSpendServiceFee",
      "msg": "Invalid Spend Service Fee"
    },
    {
      "code": 6005,
      "name": "InvalidDistributionServiceFee",
      "msg": "Invalid Distribution Service Fee"
    },
    {
      "code": 6006,
      "name": "InvalidMinWithdraw",
      "msg": "Invalid Min Withdraw"
    },
    {
      "code": 6007,
      "name": "InvalidMaxWithdraw",
      "msg": "Invalid Max Withdraw"
    },
    {
      "code": 6008,
      "name": "InvalidMinMaxWithdraw",
      "msg": "Invalid Min Max Withdraw"
    },
    {
      "code": 6009,
      "name": "DepositIsDisable",
      "msg": "Deposit Is Disable"
    },
    {
      "code": 6010,
      "name": "UserDepositIsDisable",
      "msg": "User Deposit Is Disable"
    },
    {
      "code": 6011,
      "name": "WithdrawIsDisable",
      "msg": "User Withdraw Is Disable"
    },
    {
      "code": 6012,
      "name": "UserWithdrawIsDisable",
      "msg": "User Withdraw Is Disable"
    },
    {
      "code": 6013,
      "name": "SpendIsDisable",
      "msg": "User Spend Is Disable"
    },
    {
      "code": 6014,
      "name": "UserSpendIsDisable",
      "msg": "User Spend Is Disable"
    },
    {
      "code": 6015,
      "name": "DistributeIsDisable",
      "msg": "User Distribute Is Disable"
    },
    {
      "code": 6016,
      "name": "UserDistributeIsDisable",
      "msg": "User Distribute Is Disable"
    },
    {
      "code": 6017,
      "name": "UserIsNotActive",
      "msg": "User Is Not Active"
    },
    {
      "code": 6018,
      "name": "InvalidTimestamp",
      "msg": "Invalid Timestamp"
    },
    {
      "code": 6019,
      "name": "InvalidAmount",
      "msg": "Invalid Amount"
    }
  ]
}
