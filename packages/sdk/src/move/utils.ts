import { InternalMoveModule, InternalMoveStruct } from './internal-models.js'

export const SPLITTER = '::'

export const VECTOR_STR = 'vector'

export function isFrameworkAccount(account: string) {
  const n = parseInt(account, 16)
  if (Number.isNaN(n)) {
    return false
  }
  return n >= 0 && n < 16
}

// strip any lead 0
export function accountTypeString(account: string): string {
  const withoutPrefix = account.toLowerCase().replace(/^(0x)/, '')
  return '0x' + withoutPrefix.replace(/^0*/, '')
}

const MOVE_ADDRESS_LENGTH = 32

function isHex(value: string): boolean {
  return /^(0x|0X)?[a-fA-F0-9]+$/.test(value)
}

function getHexByteLength(value: string): number {
  return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2
}

export function isValidMoveAddress(value: string): boolean {
  return isHex(value) && getHexByteLength(value) <= MOVE_ADDRESS_LENGTH
}

// Get full address with 32 bytes
export function accountAddressString(account: string): string {
  if (!isValidMoveAddress(account)) {
    throw Error('Not valid move address')
  }

  const address = account.toLowerCase().replace(/^(0x)/, '')
  return `0x${address.padStart(MOVE_ADDRESS_LENGTH * 2, '0')}`
}

const KEYWORDS = new Set(['package', 'namespace', 'volatile', 'object', 'string', 'number', 'bigint', 'any'])

export function normalizeToJSName(name: string) {
  if (KEYWORDS.has(name)) {
    return name + '_'
  }
  return name
}

export function moduleQnameForType(type: string): [string, string] {
  const parts = type.split(SPLITTER).slice(0, 2)
  return [parts[0], parts[1]]
}

export function moduleQname(module: { address: string; name: string }): string {
  return accountTypeString(module.address) + SPLITTER + module.name
}

export function structQname(module: InternalMoveModule, struct: InternalMoveStruct): string {
  return [accountTypeString(module.address), module.name, struct.name].join(SPLITTER)
}

export function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
