import { Provider } from '@ethersproject/providers'

export class Endpoints {
  // evm providers
  providers = new Map<number, Provider>()

  chainQueryAPI = ''
  priceFeedAPI = ''
}
