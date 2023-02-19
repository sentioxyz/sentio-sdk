import {
  SuiMoveNormalizedField,
  SuiMoveNormalizedFunction,
  SuiMoveNormalizedModule,
  SuiMoveNormalizedStruct,
  SuiMoveNormalizedType,
} from '@mysten/sui.js'
import {
  NeutralMoveFunction,
  NeutralMoveFunctionVisibility,
  NeutralMoveModule,
  NeutralMoveStruct,
  NeutralMoveStructField,
} from '../move/neutral-models.js'
import { SPLITTER, TypeDescriptor } from '../move/index.js'

export type { SuiAddress } from '@mysten/sui.js'

export function toNeutralModule(module: SuiMoveNormalizedModule): NeutralMoveModule {
  return {
    address: module.address,
    exposed_functions: Object.entries(module.exposed_functions).map(([n, f]) => toNeutralFunction(n, f)),
    name: module.name,
    structs: Object.entries(module.structs).map(([n, s]) => toNeutralStruct(n, s)),
  }
}

export function toNeutralFunction(name: string, func: SuiMoveNormalizedFunction): NeutralMoveFunction {
  let visibility
  switch (func.visibility) {
    case 'Private':
      visibility = NeutralMoveFunctionVisibility.PRIVATE
      break
    case 'Public':
      visibility = NeutralMoveFunctionVisibility.PUBLIC
      break
    case 'Friend':
      visibility = NeutralMoveFunctionVisibility.FRIEND
      break
  }
  return {
    generic_type_params: func.type_parameters.map((p) => {
      return { constraints: p.abilities }
    }),
    is_entry: func.is_entry,
    name: name,
    params: func.parameters.map(convertToTypeDescriptor),
    return: func.return_.map(convertToTypeDescriptor),
    visibility: visibility,
  }
}

export function toNeutralStruct(name: string, struct: SuiMoveNormalizedStruct): NeutralMoveStruct {
  return {
    abilities: struct.abilities.abilities,
    fields: struct.fields.map(toNeutralField),
    generic_type_params: struct.type_parameters.map((p) => {
      return { constraints: p.constraints.abilities }
    }),
    is_native: false,
    name: name,
  }
}

export function toNeutralField(module: SuiMoveNormalizedField): NeutralMoveStructField {
  return {
    name: module.name,
    type: convertToTypeDescriptor(module.type_),
  }
}

export function convertToTypeDescriptor(normalizedType: SuiMoveNormalizedType): TypeDescriptor {
  if (typeof normalizedType === 'string') {
    return new TypeDescriptor(normalizedType)
  }

  if ('Struct' in normalizedType) {
    // normalizedType.Struct.
    // return normalizedType;
    const qname = [normalizedType.Struct.address, normalizedType.Struct.module, normalizedType.Struct.name].join(
      SPLITTER
    )

    const args = normalizedType.Struct.type_arguments.map(convertToTypeDescriptor)

    return new TypeDescriptor(qname, args)
  }

  if ('Vector' in normalizedType) {
    return new TypeDescriptor('vector', [convertToTypeDescriptor(normalizedType.Vector)])
  }
  if ('TypeParameter' in normalizedType) {
    return new TypeDescriptor('T' + normalizedType.TypeParameter)
  }

  if ('Reference' in normalizedType) {
    const res = convertToTypeDescriptor(normalizedType.Reference)
    res.reference = true
    return res
  }

  if ('MutableReference' in normalizedType) {
    const res = convertToTypeDescriptor(normalizedType.MutableReference)
    res.reference = true
    return res
  }

  throw new Error('Unexpected sui type')
}
