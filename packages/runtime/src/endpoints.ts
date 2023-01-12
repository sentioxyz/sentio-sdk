import { Provider } from '@ethersproject/providers'

export class Endpoints {
  static INSTANCE: Endpoints = new Endpoints()

  static reset() {
    Endpoints.INSTANCE = new Endpoints()
  }
  // evm providers
  providers = new Map<number, Provider>()

  chainQueryAPI = ''
  priceFeedAPI = ''

  chainServer = new Map<string, string>()
}
