import { LogLevel } from '@sentio/sdk'
import { FuelProcessor, FuelNetwork } from '@sentio/sdk/fuel'

import abi from '../abis/fuel/counter-contract-abi.json'

FuelProcessor.bind({
  address: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
  chainId: FuelNetwork.TEST_NET,
  abi
}).onTransaction(
  async (tx, ctx) => {
    ctx.eventLogger.emit('transaction', {
      distinctId: tx.id,
      message: 'Transaction processed',
      properties: {
        fee: tx.fee.toNumber()
      },
      severity: tx.status === 'success' ? LogLevel.INFO : LogLevel.ERROR
    })
  },
  { includeFailed: true }
)
