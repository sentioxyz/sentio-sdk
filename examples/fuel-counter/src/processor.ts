import { LogLevel } from '@sentio/sdk'
import { FuelProcessor, FuelNetwork } from '@sentio/sdk/fuel'

import abi from '../abis/fuel/counter-contract-abi.json'
import { CounterContractProcessor } from './types/fuel/CounterContractProcessor.js'

FuelProcessor.bind({
  address: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
  chainId: FuelNetwork.TEST_NET,
  abi
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
  .onCall('increment', async (call, ctx) => {
    const args = call.functionScopes[0]?.getCallConfig()?.args as any[]
    ctx.eventLogger.emit('increment', {
      distinctId: ctx.transaction?.id,
      message: 'increment',
      properties: {
        arg0: String(args[0]),
        arg1: String(args[1]),
        arg2: String(args[2]),
        ret: String(call.value)
      },
      severity: ctx.transaction?.status === 'success' ? LogLevel.INFO : LogLevel.ERROR
    })
  })

CounterContractProcessor.bind({
  address: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c',
  chainId: FuelNetwork.TEST_NET
}).onCallComplext(async (call, ctx) => {}, {})
