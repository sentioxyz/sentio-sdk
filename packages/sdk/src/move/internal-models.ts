import { TypeDescriptor } from './types.js'

export interface InternalMoveModule {
  address: string
  name: string
  exposedFunctions: InternalMoveFunction[]
  structs: InternalMoveStruct[]
}

export interface InternalMoveFunction {
  name: string
  visibility: InternalMoveFunctionVisibility
  isEntry: boolean
  typeParams: InternalMoveTypeParam[]
  params: TypeDescriptor[]
  return: TypeDescriptor[]
}

export interface InternalMoveStruct {
  name: string
  isNative: boolean
  abilities: string[]
  typeParams: InternalMoveTypeParam[]
  fields: InternalMoveStructField[]
}

export interface InternalMoveStructField {
  name: string
  type: TypeDescriptor
}

export enum InternalMoveFunctionVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  FRIEND = 'friend',
}

export type InternalMoveTypeParam = {
  constraints: string[]
}
