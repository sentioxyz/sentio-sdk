export class Endpoints {
  static INSTANCE: Endpoints = new Endpoints()

  // static reset() {
  //   Endpoints.INSTANCE = new Endpoints()
  // }
  // evm providers
  // providers = new Map<bigint, Provider>()

  concurrency = 4
  chainQueryAPI = ''
  priceFeedAPI = ''

  chainServer = new Map<string, string>()
}
