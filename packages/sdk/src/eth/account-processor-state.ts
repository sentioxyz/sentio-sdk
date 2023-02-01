import { ListStateStorage } from '@sentio/runtime'
import { AccountProcessor } from './account-processor'

export class AccountProcessorState extends ListStateStorage<AccountProcessor> {
  static INSTANCE = new AccountProcessorState()
}
