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
  return module.address.toLowerCase() + SPLITTER + module.name
}

export function structQname(module: InternalMoveModule, struct: InternalMoveStruct): string {
  return [module.address, module.name, struct.name].join(SPLITTER)
}
