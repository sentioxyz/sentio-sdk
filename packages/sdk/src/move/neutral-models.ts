import { TypeDescriptor } from './types.js'

export interface NeutralMoveModule {
  address: string
  name: string

  exposed_functions: Array<NeutralMoveFunction>
  structs: Array<NeutralMoveStruct>
}

export interface NeutralMoveFunction {
  name: string
  visibility: NeutralMoveFunctionVisibility
  is_entry: boolean
  generic_type_params: Array<NeutralMoveGenericTypeParam>
  params: Array<TypeDescriptor>
  return: Array<TypeDescriptor>
}

export interface NeutralMoveStruct {
  name: string

  is_native: boolean

  abilities: Array<string>

  generic_type_params: Array<NeutralMoveGenericTypeParam>

  fields: Array<NeutralMoveStructField>
}

export interface NeutralMoveStructField {
  name: string
  type: TypeDescriptor
}

export enum NeutralMoveFunctionVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  FRIEND = 'friend',
}

export type NeutralMoveGenericTypeParam = {
  constraints: Array<string>
}
