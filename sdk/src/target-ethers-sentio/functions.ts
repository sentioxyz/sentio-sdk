import { generateInputTypes } from '@typechain/ethers-v5/dist/codegen/types'
import { FunctionDeclaration, getSignatureForFn } from 'typechain'

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
  return `
  export interface ${capitalizeFirstChar(overloadedName ?? fn.name)}CallTrace extends TypedTrace {
    args: [${generateInputTypes(fn.inputs, { useStructs: true })}]
  }
  `
}

function generateFunction(fn: FunctionDeclaration, contractName: string, overloadedName?: string): string {
  return `
  on${capitalizeFirstChar(overloadedName ?? fn.name)}Call(
    handler: (trace: ${capitalizeFirstChar(overloadedName ?? fn.name)}CallTrace, ctx: ${contractName}Context) => void
  ) {
    return super.onTrace("${getSignatureForFn(fn)}", handler);
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
