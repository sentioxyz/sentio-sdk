import {
  generateOutputComplexTypeAsArray,
  generateOutputComplexTypesAsObject,
} from '@typechain/ethers-v5/dist/codegen/types'
import { FunctionDeclaration, getSignatureForFn } from 'typechain'
import { utils } from 'ethers'
import { getFullSignatureAsSymbolForFunction } from './types'

export function generateCallHandlers(fns: FunctionDeclaration[], contractName: string): string {
  if (fns.length === 1) {
    return generateCallHandler(fns[0], contractName)
  }

  return fns.map((fn) => generateCallHandler(fn, contractName, getFullSignatureAsSymbolForFunction(fn))).join('\n')
}

export function codegenCallTraceTypes(fns: FunctionDeclaration[]): string {
  if (fns.length === 1) {
    return codegenCallTraceType(fns[0])
  }

  return fns.map((fn) => codegenCallTraceType(fn, getFullSignatureAsSymbolForFunction(fn))).join('\n')
}

function codegenCallTraceType(fn: FunctionDeclaration, overloadedName?: string): string {
  const identifier = capitalizeFirstChar(overloadedName ?? fn.name)

  const components = fn.inputs.map((input, i) => ({ name: input.name ?? `arg${i.toString()}`, type: input.type }))
  const arrayOutput = generateOutputComplexTypeAsArray(components, { useStructs: true })
  const objectOutput = generateOutputComplexTypesAsObject(components, { useStructs: true }) || '{}'

  return `
  export interface ${identifier}CallObject ${objectOutput}
    
  export type ${identifier}CallTrace = TypedCallTrace<${arrayOutput}, ${identifier}CallObject>
  `
}

function generateCallHandler(fn: FunctionDeclaration, contractName: string, overloadedName?: string): string {
  const signature = getSignatureForFn(fn)
  const sighash = utils.keccak256(utils.toUtf8Bytes(signature)).substring(0, 10)

  return `
  onCall${capitalizeFirstChar(overloadedName ?? fn.name)}(
    handler: (call: ${capitalizeFirstChar(overloadedName ?? fn.name)}CallTrace, ctx: ${contractName}Context) => void,
    fetchConfig?: EthFetchConfig
  ) {
    return super.onTrace("${sighash}", handler, fetchConfig);
  }
`
}

function capitalizeFirstChar(input: string): string {
  if (!input) {
    return input
  }
  return input[0].toUpperCase() + (input.length > 1 ? input.substring(1) : '')
}
