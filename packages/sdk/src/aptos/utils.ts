import { TypeDescriptor } from '../move/index.js'

export function getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
  if (params.length === 0) {
    return params
  }
  if (params[0].qname === 'signer' && params[0].reference) {
    params = params.slice(1)
  }
  return params
}
