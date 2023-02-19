export class Endpoints {
  static INSTANCE: Endpoints = new Endpoints()

  concurrency = 4
  chainQueryAPI = ''
  priceFeedAPI = ''

  chainServer = new Map<string, string>()
}
