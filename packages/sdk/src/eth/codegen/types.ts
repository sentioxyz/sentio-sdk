import {
  AbiOutputParameter,
  AbiParameter,
  ArrayType,
  EventArgDeclaration,
  EventDeclaration,
  FunctionDeclaration,
  TupleType
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

export function getFullSignatureWithOutputForFn(fn: FunctionDeclaration) {
  return `${fn.name}(${fn.inputs.map((i) => getArgumentForSignature(i)).join(', ')}) ${fn.stateMutability != 'nonpayable' ? fn.stateMutability + ' ' : ''}returns (${fn.outputs
    .map((i) => getOutputArgumentForSignature(i))
    .filter((s) => s != '')
    .join(', ')})`
}

function getOutputArgumentForSignature(argument: AbiOutputParameter) {
  if (argument.type.type == 'void') {
    return ''
  }
  return getArgumentForSignature(argument as AbiParameter)
}

function getArgumentForSignature(argument: EventArgDeclaration | AbiParameter): string {
  if (argument.type.originalType === 'tuple') {
    return `(${(argument.type as TupleType).components.map((i) => getTypeWithName(getArgumentForSignature(i), i.name)).join(', ')})`
  } else if (argument.type.originalType.startsWith('tuple')) {
    const arr = argument.type as ArrayType
    return getTypeWithName(
      `${getArgumentForSignature({
        name: '',
        type: arr.itemType
      })}[${arr.size?.toString() || ''}]`,
      argument.name
    )
  } else {
    return getTypeWithName(argument.type.originalType, argument.name)
  }
}

function getTypeWithName(type: string, name?: string) {
  return (name ?? '').length > 0 ? `${type} ${name}` : type
}
