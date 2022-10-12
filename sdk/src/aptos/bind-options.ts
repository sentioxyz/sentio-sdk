import Long from 'long'

export enum AptosNetwork {
  MAIN_NET = 0,
  TEST_NET = 1,
  // DEV_NET,
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.TEST_NET
  name?: string
  startVersion?: Long | number
  // endBlock?: Long | number
}
