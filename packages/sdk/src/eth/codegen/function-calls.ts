// https://github.com/dethcrypto/TypeChain/blob/015abb28bd22826611051f27e0ec96a00f9a0b61/packages/target-ethers-v5/src/codegen/functions.ts#L54
import { FunctionDeclaration, getSignatureForFn } from 'typechain'
import { generateInputTypes, generateOutputTypes } from '@sentio/ethers-v6/dist/codegen/types.js'
import {
  getFullSignatureAsSymbolForFunction,
  getFullSignatureForFunction,
  getFullSignatureWithOutputForFn
} from './types.js'

function generateReturnTypes(fn: FunctionDeclaration) {
  // sounds like returnResultObject should be true but we need to set false to make it work
  return `Promise<${generateOutputTypes({ returnResultObject: false, useStructs: true }, fn.outputs)}>`
}

export function generateViewFunctions(view: boolean, functions: FunctionDeclaration[]): string[] {
  const includeArgTypes = functions.length !== 1
  return functions.flatMap((fn) => generateViewFunction(view, fn, includeArgTypes))
}

export function generateFunctionSignatures(functions: FunctionDeclaration[]): string[] {
  return functions.map((fn) => `"function ${getFullSignatureWithOutputForFn(fn)}"`)
}

export function generateViewFunction(view: boolean, fn: FunctionDeclaration, includeArgTypes: boolean): string[] {
  const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure'
  if (view !== isView) {
    return []
  }
  const declName = includeArgTypes ? getFullSignatureAsSymbolForFunction(fn) : fn.name

  const call = view ? '' : '.staticCall'

  const func = `this.contract.getFunction("` + getFullSignatureForFunction(fn) + '")'
  // if (overrides) {
  //   return await ${call}(${
  //   fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
  // } overrides)
  //     } else {
  //       return await ${call}(${fn.inputs.map((input, index) => input.name || `arg${index}`).join(',')})
  //     }
  return [
    `
  async ${declName}(${generateInputTypes(fn.inputs, {
    useStructs: true
  })}overrides?: Overrides, preparedData?: PreparedData, ethCallContext?: EthCallContext): ${generateReturnTypes(fn)} {
    try {
      if (preparedData?.ethCallResults && ethCallContext) {
        const calldata = iface.encodeFunctionData(
          "${fn.name}",[${
            fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
          }] 
        )
        const ethCallKey = makeEthCallKey({
          context: ethCallContext,
          calldata
        })
        const ret = preparedData.ethCallResults[ethCallKey]
        if (ret) {
          const result = iface.decodeFunctionResult("${fn.name}", ret).toArray()
          return result.length == 1? result[0]: result
        }
      }
      return await ${func}${call}(${
        fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
      } overrides || {})
    } catch (e) {
      const stack = new Error().stack
      throw transformEtherError(e, undefined, stack)
    }
  }
  `
  ]
}

export function generateBoundViewFunctions(view: boolean, functions: FunctionDeclaration[]): string[] {
  const includeArgTypes = functions.length !== 1
  return functions.flatMap((fn) => generateBoundViewFunction(view, fn, includeArgTypes))
}

export function generateBoundViewFunction(view: boolean, fn: FunctionDeclaration, includeArgTypes: boolean): string[] {
  const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure'
  if (view !== isView) {
    return []
  }
  const declName = includeArgTypes ? getFullSignatureAsSymbolForFunction(fn) : fn.name

  const qualifier = view ? 'view' : 'view.callStatic'

  return [
    `
  async ${declName ?? fn.name}(${generateInputTypes(fn.inputs, {
    useStructs: true
  })}overrides?: Overrides): ${generateReturnTypes(fn)} {
    const ethCallContext = {
      chainId: this.context.chainId,
      blockTag: "0x" + this.context.blockNumber.toString(16),
      address: this.context.address,
    }
    return await this.${qualifier}.${declName}(${
      fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
    } {
      blockTag: this.context.blockNumber,
      ...overrides
    }, this.context.preparedData, ethCallContext)
  }
  `
  ]
}

// TODO add tests for these
export function generateFunctionCallEncoders(functions: FunctionDeclaration[]): string[] {
  const includeArgTypes = functions.length !== 1
  return functions.flatMap((fn) => generateFunctionCallEncoder(fn, includeArgTypes))
}

export function generateFunctionCallEncoder(fn: FunctionDeclaration, includeArgTypes: boolean): string[] {
  const declName = includeArgTypes ? getFullSignatureAsSymbolForFunction(fn) : fn.name
  return [
    `
  ${declName}(${generateInputTypes(fn.inputs, {
    useStructs: true
  })}ethCallContext: EthCallContext): EthCallParam {
    try {
      const iface = new Interface(["function ${getSignatureForFn(fn)}"])
      const calldata = iface.encodeFunctionData(
        "${fn.name}",[${
          fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
        }] 
      )
      return {
        context: ethCallContext,
        calldata
      }
    } catch (e) {
      const stack = new Error().stack
      throw transformEtherError(e, undefined, stack)
    }
  }
  `
  ]
}

export function generateBoundFunctionCallEncoders(functions: FunctionDeclaration[]): string[] {
  const includeArgTypes = functions.length !== 1
  return functions.flatMap((fn) => generateBoundFunctionCallEncoder(fn, includeArgTypes))
}

export function generateBoundFunctionCallEncoder(fn: FunctionDeclaration, includeArgTypes: boolean): string[] {
  const declName = includeArgTypes ? getFullSignatureAsSymbolForFunction(fn) : fn.name

  // TODO need override address?
  return [
    `
  ${declName ?? fn.name}(${generateInputTypes(fn.inputs, {
    useStructs: true
  })}overrides?: Overrides): EthCallParam {
    const chainId = overrides?.chainId?.toString() ?? this.context.chainId.toString()
    const address = this.context.address
    let blockTag = "0x" + this.context.blockNumber.toString(16)
    if (overrides?.blockTag) {
      blockTag = typeof(overrides.blockTag) == 'string'? overrides.blockTag: "0x" + overrides.blockTag.toString(16)
    }
    
    return this.view.encodeCall.${declName}(${
      fn.inputs.length > 0 ? fn.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
    }{chainId, address, blockTag})
  }
  `
  ]
}
