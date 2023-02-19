import { Types } from 'aptos-sdk'
import {
  NeutralMoveFunction,
  NeutralMoveFunctionVisibility,
  NeutralMoveModule,
  NeutralMoveStruct,
  NeutralMoveStructField,
} from '../move/neutral-models.js'
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

export function toNeutralModule(module: MoveModuleBytecode): NeutralMoveModule {
  if (!module.abi) {
    throw Error('module with no ABI found')
  }
  const abi = module.abi
  return {
    address: abi.address,
    exposed_functions: abi.exposed_functions.map(toNeutralFunction),
    name: abi.name,
    structs: abi.structs.map(toNeutralStruct),
  }
}

export function toNeutralFunction(func: MoveFunction): NeutralMoveFunction {
  let visibility
  switch (func.visibility) {
    case Types.MoveFunctionVisibility.PRIVATE:
      visibility = NeutralMoveFunctionVisibility.PRIVATE
      break
    case Types.MoveFunctionVisibility.PUBLIC:
      visibility = NeutralMoveFunctionVisibility.PUBLIC
      break
    case Types.MoveFunctionVisibility.FRIEND:
      visibility = NeutralMoveFunctionVisibility.FRIEND
      break
  }
  return {
    generic_type_params: func.generic_type_params,
    is_entry: func.is_entry,
    name: func.name,
    params: func.params.map(parseMoveType),
    return: func.return.map(parseMoveType),
    visibility: visibility,
  }
}

export function toNeutralStruct(struct: MoveStruct): NeutralMoveStruct {
  return {
    abilities: struct.abilities,
    fields: struct.fields.map(toNeutralField),
    generic_type_params: struct.generic_type_params,
    is_native: struct.is_native,
    name: struct.name,
  }
}

export function toNeutralField(module: MoveStructField): NeutralMoveStructField {
  return {
    name: module.name,
    type: parseMoveType(module.type),
  }
}
