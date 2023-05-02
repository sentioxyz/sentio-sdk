import { HexString, TxnBuilderTypes } from 'aptos-sdk'
// import { isFrameworkAccount } from '../move/index.js'

export function isValidAptosAddress(value: string): boolean {
  return TxnBuilderTypes.AccountAddress.isValid(value)
}

export function validateAndNormalizeAddress(address: string): string {
  const hex = TxnBuilderTypes.AccountAddress.fromHex(address).toHexString()
  // if (isFrameworkAccount(address)) {
  //   return HexString.ensure(hex).toShortString()
  // }
  // return hex.toString()
  return HexString.ensure(hex).toShortString()
}
