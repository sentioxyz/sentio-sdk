// https://github.com/dethcrypto/TypeChain/blob/015abb28bd22826611051f27e0ec96a00f9a0b61/packages/target-ethers-v5/src/codegen/functions.ts#L54
import { FunctionDeclaration } from 'typechain'
import { generateInputTypes, generateOutputTypes } from '@typechain/ethers-v5/dist/codegen/types'
import { getFullSignatureAsSymbolForFunction, getFullSignatureForFunction } from './types'

function generateReturnTypes(fn: FunctionDeclaration) {
  // sounds like returnResultObject should be true but we need to set false to make it work
  return `Promise<${generateOutputTypes({ returnResultObject: false, useStructs: true }, fn.outputs)}>`
}

export function generateViewFunctions(functions: FunctionDeclaration[]): string {
  if (functions.length === 1) {
    return generateViewFunction(functions[0], false)
  }
  return functions.map((fn) => generateViewFunction(fn, true)).join('\n')
}

export function generateViewFunction(fn: FunctionDeclaration, includeArgTypes: boolean): string {
  if (fn.stateMutability !== 'view' && fn.stateMutability !== 'pure') {
    return ''
  }
  const declName = includeArgTypes ? getFullSignatureAsSymbolForFunction(fn) : fn.name
  const call = includeArgTypes ? 'this.contract["' + getFullSignatureForFunction(fn) + '"]' : 'this.contract.' + fn.name

  return `
  async ${declName}(${generateInputTypes(fn.inputs, {
    useStructs: true,
  })}overrides?: CallOverrides): ${generateReturnTypes(fn)} {
    try {
      if (overrides) {
        return await ${call}(${
    fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
  } overrides)
      } else {
        return await ${call}(${fn.inputs.map((input, index) => input.name || `arg${index}`).join(',')})
      }
    } catch (e) {
      throw transformEtherError(e, undefined)
    }
  }
  `
}

export function generateBoundViewFunctions(functions: FunctionDeclaration[]): string {
  if (functions.length === 1) {
    return generateBoundViewFunction(functions[0], false)
  }
  return functions.map((fn) => generateBoundViewFunction(fn, true)).join('\n')
}

export function generateBoundViewFunction(fn: FunctionDeclaration, includeArgTypes: boolean): string {
  if (fn.stateMutability !== 'view' && fn.stateMutability !== 'pure') {
    return ''
  }
  const declName = includeArgTypes ? getFullSignatureAsSymbolForFunction(fn) : fn.name

  return `
  async ${declName ?? fn.name}(${generateInputTypes(fn.inputs, {
    useStructs: true,
  })}overrides?: CallOverrides): ${generateReturnTypes(fn)} {
    try {
      if (!overrides && this.context) {
        overrides = {
          blockTag: this.context.blockNumber.toNumber(),
        }
      }
      if (overrides) {
        return await this.view.${declName}(${
    fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
  } overrides)
      } else {
        return await this.view.${declName}(${fn.inputs.map((input, index) => input.name || `arg${index}`).join(',')})
      }
    } catch (e) {
      throw transformEtherError(e, this.context)
    }
  }
  `
}
