import { InternalMoveModule, InternalMoveStruct } from './internal-models.js'

export const SPLITTER = '::'

export const VECTOR_STR = 'vector'

export function isFrameworkAccount(account: string) {
  return account === '0x1' || account === '0x2' || account === '0x3'
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
