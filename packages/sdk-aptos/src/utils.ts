import { MoveFunction, MoveModule } from './move-types'

export const SPLITTER = '::'

export const VECTOR_STR = 'vector'

export function isFrameworkAccount(account: string) {
  return account === '0x1' || account === '0x2' || account === '0x3'
}

export function moduleQname(module: MoveModule): string {
  return module.address.toLowerCase() + SPLITTER + module.name
}

export function moduleQnameForType(type: string): [string, string] {
  const parts = type.split(SPLITTER).slice(0, 2)
  return [parts[0], parts[1]]
}

export function getMeaningfulFunctionParams(func: MoveFunction): string[] {
  let params = func.params
  if (func.params[0] === '&signer') {
    params = params.slice(1)
  }
  return params
}
