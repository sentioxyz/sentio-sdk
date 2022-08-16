import { Networkish } from '@ethersproject/networks'
import Long from 'long'

export class BindOptions {
  address: string
  network?: Networkish = 1
  name?: string
  startBlock?: Long | number
  endBlock?: Long | number
}

export class BindInternalOptions {
  address: string
  network: Networkish
  name: string
  startBlock: Long
  endBlock?: Long
}
