import { LogLevel } from '@sentio/sdk'
import { FuelNetwork } from '@sentio/sdk/fuel'

import { CounterContractProcessor } from './types/fuel/CounterContractProcessor.js'

CounterContractProcessor.bind({
  address: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
  chainId: FuelNetwork.TEST_NET
})
  .onTransaction(
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
  .onLogFoo(async (log, ctx) => {
    ctx.meter.Counter('fooLogged').add(1, { baz: String(log.data.baz) })
  })
