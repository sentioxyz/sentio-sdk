import {
  AbiOutputParameter,
  AbiParameter,
  EventDeclaration,
  FunctionDeclaration,
  getArgumentForSignature,
  getSignatureForFn
} from 'typechain'
import { EvmType } from 'typechain/dist/parser/parseEvmType.js'

export function getFullSignatureAsSymbolForFunction(fn: FunctionDeclaration): string {
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

function formatType(type: EvmType): string {
  if (type.type === 'array') {
    return formatType(type.itemType) + `[${type.size || ''}]`
  } else if (type.type === 'tuple') {
    return '(' + type.components.map((s) => formatType(s.type)).join(',') + ')'
  } else {
    return type.originalType
  }
}

// TODO contribute upstream
export function getFullSignatureForEventPatched(event: EventDeclaration): string {
  return `${event.name}(${event.inputs
    .map((e) => {
      return formatType(e.type)
    })
    .join(',')})`
}

// TODO check existed func
export function getFullSignatureForFunction(fn: FunctionDeclaration): string {
  return `${fn.name}(${fn.inputs
    .map((e) => {
      return formatType(e.type)
    })
    .join(',')})`
}

function getOutputArgumentForSignature(argument: AbiOutputParameter) {
  if (argument.type.type == 'void') {
    return ''
  }
  return getArgumentForSignature(argument as AbiParameter)
}

export function getFullSignatureWithOutputForFn(fn: FunctionDeclaration) {
  return `${getSignatureForFn(fn)} ${fn.stateMutability} returns (${fn.outputs
    .map((i) => getOutputArgumentForSignature(i))
    .filter((s) => s != '')
    .join(',')})`
}
