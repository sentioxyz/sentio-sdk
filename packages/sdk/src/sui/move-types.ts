import type {
  SuiMoveNormalizedField,
  SuiMoveNormalizedFunction,
  SuiMoveNormalizedModule,
  SuiMoveNormalizedStruct,
  SuiMoveNormalizedType,
} from '@mysten/sui.js'
import {
  InternalMoveFunction,
  InternalMoveFunctionVisibility,
  InternalMoveModule,
  InternalMoveStruct,
  InternalMoveStructField,
} from '../move/internal-models.js'
import { SPLITTER, TypeDescriptor } from '../move/index.js'

export function toInternalModule(module: SuiMoveNormalizedModule): InternalMoveModule {
  return {
    address: module.address,
    exposedFunctions: Object.entries(module.exposedFunctions).map(([n, f]) => toInternalFunction(n, f)),
    name: module.name,
    structs: Object.entries(module.structs).map(([n, s]) => toInternalStruct(n, s)),
  }
}

export function toInternalFunction(name: string, func: SuiMoveNormalizedFunction): InternalMoveFunction {
  let visibility
  switch (func.visibility) {
    case 'Private':
      visibility = InternalMoveFunctionVisibility.PRIVATE
      break
    case 'Public':
      visibility = InternalMoveFunctionVisibility.PUBLIC
      break
    case 'Friend':
      visibility = InternalMoveFunctionVisibility.FRIEND
      break
    default:
      throw Error('No visibility for function' + name)
  }
  return {
    typeParams: func.typeParameters.map((p: any) => {
      return { constraints: p.abilities }
    }),
    isEntry: func.isEntry,
    name: name,
    params: func.parameters.map(toTypeDescriptor),
    return: func.return.map(toTypeDescriptor),
    visibility: visibility,
  }
}

export function toInternalStruct(name: string, struct: SuiMoveNormalizedStruct): InternalMoveStruct {
  return {
    abilities: struct.abilities.abilities,
    fields: struct.fields.map(toInternalField),
    typeParams: struct.typeParameters.map((p: any) => {
      return { constraints: p.constraints.abilities }
    }),
    isNative: false,
    name: name,
  }
}

export function toInternalField(module: SuiMoveNormalizedField): InternalMoveStructField {
  return {
    name: module.name,
    type: toTypeDescriptor(module.type),
  }
}

export function toTypeDescriptor(normalizedType: SuiMoveNormalizedType): TypeDescriptor {
  if (typeof normalizedType === 'string') {
    return new TypeDescriptor(normalizedType)
  }

  if ('Struct' in normalizedType) {
    const qname = [normalizedType.Struct.address, normalizedType.Struct.module, normalizedType.Struct.name].join(
      SPLITTER
    )

    const args = normalizedType.Struct.typeArguments.map(toTypeDescriptor)

    return new TypeDescriptor(qname, args)
  }

  if ('Vector' in normalizedType) {
    return new TypeDescriptor('Vector', [toTypeDescriptor(normalizedType.Vector)])
  }
  if ('TypeParameter' in normalizedType) {
    return new TypeDescriptor('T' + normalizedType.TypeParameter)
  }

  if ('Reference' in normalizedType) {
    const res = toTypeDescriptor(normalizedType.Reference)
    res.reference = true
    return res
  }

  if ('MutableReference' in normalizedType) {
    const res = toTypeDescriptor(normalizedType.MutableReference)
    res.reference = true
    res.mutable = true
    return res
  }

  throw new Error('Unexpected sui type')
}
