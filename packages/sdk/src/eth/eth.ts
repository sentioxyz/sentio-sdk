import { LogParams } from 'ethers/providers'
import { Result } from 'ethers'

export interface Eth<TArgsArray extends Array<any> = any, TArgsObject = any> extends LogParams {
  args: TArgsArray & TArgsObject & Result
}
