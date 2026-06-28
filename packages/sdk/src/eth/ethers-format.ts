//
// Vendored (trimmed) from ethers v6.17.0 `src.ts/providers/format.ts`.
//
// ethers' internal response formatters are NOT part of its public API. The
// retired `@sentio/ethers` fork exposed them via an extra
// `export * from "./format.js"` in `providers/index.ts`, and `eth.ts` /
// `context.ts` imported `allowNull` / `arrayOf` / `formatBlock` from
// `ethers/providers`. Upstream keeps them private, so we vendor just the subset
// the SDK actually uses (reachable from those three functions); the import paths
// are rewritten to ethers' public subpath exports. Keep in sync with upstream if
// bumping ethers across a release that changes block/transaction formatting.
//
import { getAddress, getCreateAddress } from 'ethers/address'
import { Signature } from 'ethers/crypto'
import { accessListify } from 'ethers/transaction'
import { getBigInt, getNumber, isHexString, assert, assertArgument } from 'ethers/utils'

import type { SignatureLike } from 'ethers/crypto'
import type { BlockParams, TransactionResponseParams } from 'ethers/providers'

const BN_0 = BigInt(0)

export type FormatFunc = (value: any) => any

export function allowNull(format: FormatFunc, nullValue?: any): FormatFunc {
  return function (value: any) {
    if (value == null) {
      return nullValue
    }
    return format(value)
  }
}

export function arrayOf(format: FormatFunc, allowNull?: boolean): FormatFunc {
  return (array: any) => {
    if (allowNull && array == null) {
      return null
    }
    if (!Array.isArray(array)) {
      throw new Error('not an array')
    }
    return array.map((i) => format(i))
  }
}

// Requires an object which matches a fleet of other formatters
// Any FormatFunc may return `undefined` to have the value omitted
// from the result object. Calls preserve `this`.
function object(format: Record<string, FormatFunc>, altNames?: Record<string, Array<string>>): FormatFunc {
  return (value: any) => {
    const result: any = {}
    for (const key in format) {
      let srcKey = key
      if (altNames && key in altNames && !(srcKey in value)) {
        for (const altKey of altNames[key]) {
          if (altKey in value) {
            srcKey = altKey
            break
          }
        }
      }

      try {
        const nv = format[key](value[srcKey])
        if (nv !== undefined) {
          result[key] = nv
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'not-an-error'
        assert(false, `invalid value for value.${key} (${message})`, 'BAD_DATA', { value })
      }
    }
    return result
  }
}

function formatData(value: string): string {
  assertArgument(isHexString(value, true), 'invalid data', 'value', value)
  return value
}

function formatHash(value: any): string {
  assertArgument(isHexString(value, 32), 'invalid hash', 'value', value)
  return value
}

const _formatBlock = object(
  {
    hash: allowNull(formatHash),
    parentHash: formatHash,
    parentBeaconBlockRoot: allowNull(formatHash, null),

    number: getNumber,

    timestamp: getNumber,
    nonce: allowNull(formatData),
    difficulty: getBigInt,

    gasLimit: getBigInt,
    gasUsed: getBigInt,

    stateRoot: allowNull(formatHash, null),
    receiptsRoot: allowNull(formatHash, null),
    transactionsRoot: allowNull(formatHash, null),

    blobGasUsed: allowNull(getBigInt, null),
    excessBlobGas: allowNull(getBigInt, null),

    miner: allowNull(getAddress),
    prevRandao: allowNull(formatHash, null),
    extraData: formatData,

    baseFeePerGas: allowNull(getBigInt)
  },
  {
    prevRandao: ['mixHash']
  }
)

export function formatBlock(value: any): BlockParams {
  const result = _formatBlock(value)
  result.transactions = value.transactions.map((tx: string | TransactionResponseParams) => {
    if (typeof tx === 'string') {
      return tx
    }
    return formatTransactionResponse(tx)
  })
  return result
}

function formatTransactionResponse(value: any): TransactionResponseParams {
  // Some clients (TestRPC) do strange things like return 0x0 for the
  // 0 address; correct this to be a real address
  if (value.to && getBigInt(value.to) === BN_0) {
    value.to = '0x0000000000000000000000000000000000000000'
  }

  const result = object(
    {
      hash: formatHash,

      // Some nodes do not return this, usually test nodes (like Ganache)
      index: allowNull(getNumber, undefined),

      type: (value: any) => {
        if (value === '0x' || value == null) {
          return 0
        }
        return getNumber(value)
      },
      accessList: allowNull(accessListify, null),
      blobVersionedHashes: allowNull(arrayOf(formatHash, true), null),

      authorizationList: allowNull(
        arrayOf((v: any) => {
          let sig: SignatureLike
          if (v.signature) {
            sig = v.signature
          } else {
            let yParity = v.yParity
            if (yParity === '0x1b') {
              yParity = 0
            } else if (yParity === '0x1c') {
              yParity = 1
            }
            sig = Object.assign({}, v, { yParity })
          }

          return {
            address: getAddress(v.address),
            chainId: getBigInt(v.chainId),
            nonce: getBigInt(v.nonce),
            signature: Signature.from(sig)
          }
        }, false),
        null
      ),

      blockHash: allowNull(formatHash, null),
      blockNumber: allowNull(getNumber, null),
      transactionIndex: allowNull(getNumber, null),

      from: getAddress,

      // either (gasPrice) or (maxPriorityFeePerGas + maxFeePerGas) must be set
      gasPrice: allowNull(getBigInt),
      maxPriorityFeePerGas: allowNull(getBigInt),
      maxFeePerGas: allowNull(getBigInt),
      maxFeePerBlobGas: allowNull(getBigInt, null),

      gasLimit: getBigInt,
      to: allowNull(getAddress, null),
      value: getBigInt,
      nonce: getNumber,
      data: formatData,

      creates: allowNull(getAddress, null),

      chainId: allowNull(getBigInt, null)
    },
    {
      data: ['input'],
      gasLimit: ['gas'],
      index: ['transactionIndex']
    }
  )(value)

  // If to and creates are empty, populate the creates from the value
  if (result.to == null && result.creates == null) {
    result.creates = getCreateAddress(result)
  }

  // Add an access list to supported transaction types
  if ((value.type === 1 || value.type === 2) && value.accessList == null) {
    result.accessList = []
  }

  // Compute the signature
  if (value.signature) {
    result.signature = Signature.from(value.signature)
  } else {
    result.signature = Signature.from(value)
  }

  // Some backends omit ChainId on legacy transactions, but we can compute it
  if (result.chainId == null) {
    const chainId = result.signature.legacyChainId
    if (chainId != null) {
      result.chainId = chainId
    }
  }

  // 0x0000... should actually be null
  if (result.blockHash && getBigInt(result.blockHash) === BN_0) {
    result.blockHash = null
  }

  return result
}
