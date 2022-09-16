import {
  generateOutputComplexTypeAsArray,
  generateOutputComplexTypesAsObject,
} from '@typechain/ethers-v5/dist/codegen/types'
import { FunctionDeclaration, getSignatureForFn } from 'typechain'
import { utils } from 'ethers'

export function codegenFunctions(fns: FunctionDeclaration[], contractName: string): string {
  if (fns.length === 1) {
    return generateFunction(fns[0], contractName)
  }

  return fns.map((fn) => generateFunction(fn, contractName, getFullSignatureAsSymbolForFunction(fn))).join('\n')
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

function generateFunction(fn: FunctionDeclaration, contractName: string, overloadedName?: string): string {
  const signature = getSignatureForFn(fn)
  const sighash = utils.keccak256(utils.toUtf8Bytes(signature)).substring(0, 10)

  return `
  onCall${capitalizeFirstChar(overloadedName ?? fn.name)}(
    handler: (call: ${capitalizeFirstChar(overloadedName ?? fn.name)}CallTrace, ctx: ${contractName}Context) => void
  ) {
    return super.onTrace("${sighash}", handler);
  }
`
}

function getFullSignatureAsSymbolForFunction(fn: FunctionDeclaration): string {
  return `${fn.name}_${fn.inputs
    .map((e) => {
      if (e.type.type === 'array') {
        return e.type.itemType.originalType + '_array'
      } else {
        return e.type.originalType
      }
    })
    .join('_')}`
}

function capitalizeFirstChar(input: string): string {
  if (!input) {
    return input
  }
  return input[0].toUpperCase() + (input.length > 1 ? input.substring(1) : '')
}
