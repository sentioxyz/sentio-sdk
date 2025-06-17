import {
  generateOutputComplexTypeAsArray,
  generateOutputComplexTypesAsObject
} from '@sentio/ethers-v6/dist/codegen/types.js'
import sha3 from 'js-sha3'
import { FunctionDeclaration, getSignatureForFn } from 'typechain'
import { getFullSignatureAsSymbolForFunction } from './types.js'
import { upperFirst } from '../../move/index.js'

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
  const identifier = upperFirst(overloadedName ?? fn.name)

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
  const test = new TextEncoder().encode(signature)
  const sighash = '0x' + sha3.keccak_256(test).substring(0, 8)

  return `
  onCall${upperFirst(overloadedName ?? fn.name)}(
    handler: (call: ${upperFirst(overloadedName ?? fn.name)}CallTrace, ctx: ${contractName}Context) => void,
    handlerOptions?: HandlerOptions<EthFetchConfig, ${upperFirst(overloadedName ?? fn.name)}CallTrace>,
    preprocessHandler?: (call: ${upperFirst(overloadedName ?? fn.name)}CallTrace, ctx: ${contractName}Context) => Promise<PreprocessResult>
  ): this {
    return super.onEthTrace("${sighash}", handler as any, handlerOptions, preprocessHandler);
  }
`
}
