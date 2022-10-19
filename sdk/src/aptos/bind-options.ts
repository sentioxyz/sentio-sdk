import Long from 'long'

export enum AptosNetwork {
  MAIN_NET = 1,
  TEST_NET = 2,
  // DEV_NET,
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.TEST_NET
  startVersion?: Long | number
  // endBlock?: Long | number
}
