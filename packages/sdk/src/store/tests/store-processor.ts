import { AccountProcessor } from '../../eth/account-processor.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Transaction } from './generated/schema.js'
const ADDRESS = '0x1000000000000000000000000000000000000000'

AccountProcessor.bind({ address: ADDRESS }).onERC20TransferOut(async (evt, ctx) => {
  const tx = new Transaction({
    arrayOfArrayValue: [],
    arrayValue: [],
    gas: 0n,
    gasPrice: new BigDecimal(0),
    value: Number(evt.args.value),
    id: evt.transactionHash
  })

  await ctx.store.upsert(tx)
})
