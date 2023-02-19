import { Types } from 'aptos-sdk'
import {
  InternalMoveFunction,
  InternalMoveFunctionVisibility,
  InternalMoveModule,
  InternalMoveStruct,
  InternalMoveStructField,
} from '../move/internal-models.js'
import { parseMoveType } from '../move/index.js'

export type Address = Types.Address
export type Event = Types.Event
export type MoveFunction = Types.MoveFunction
export type MoveModule = Types.MoveModule
export type MoveResource = Types.MoveResource
export type MoveStruct = Types.MoveStruct
export type MoveStructField = Types.MoveStructField
export type MoveModuleBytecode = Types.MoveModuleBytecode
export type TransactionPayload_EntryFunctionPayload = Types.TransactionPayload_EntryFunctionPayload
export type Transaction_UserTransaction = Types.Transaction_UserTransaction

export function toInternalModule(module: MoveModuleBytecode): InternalMoveModule {
  if (!module.abi) {
    throw Error('module with no ABI found')
  }
  const abi = module.abi
  return {
    address: abi.address,
    exposedFunctions: abi.exposed_functions.map(toInternalFunction),
    name: abi.name,
    structs: abi.structs.map(toInternalStruct),
  }
}

export function toInternalFunction(func: MoveFunction): InternalMoveFunction {
  let visibility
  switch (func.visibility) {
    case Types.MoveFunctionVisibility.PRIVATE:
      visibility = InternalMoveFunctionVisibility.PRIVATE
      break
    case Types.MoveFunctionVisibility.PUBLIC:
      visibility = InternalMoveFunctionVisibility.PUBLIC
      break
    case Types.MoveFunctionVisibility.FRIEND:
      visibility = InternalMoveFunctionVisibility.FRIEND
      break
  }
  return {
    typeParams: func.generic_type_params,
    isEntry: func.is_entry,
    name: func.name,
    params: func.params.map(parseMoveType),
    return: func.return.map(parseMoveType),
    visibility: visibility,
  }
}

export function toInternalStruct(struct: MoveStruct): InternalMoveStruct {
  return {
    abilities: struct.abilities,
    fields: struct.fields.map(toInternalField),
    typeParams: struct.generic_type_params,
    isNative: struct.is_native,
    name: struct.name,
  }
}

export function toInternalField(module: MoveStructField): InternalMoveStructField {
  return {
    name: module.name,
    type: parseMoveType(module.type),
  }
}
