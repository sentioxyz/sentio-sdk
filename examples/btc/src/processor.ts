import { BTCProcessor } from '@sentio/sdk/btc'
import { ChainId } from '@sentio/chain'

const address = 'bc1pjy5mq7vlqkq6nldxghauq0sqgh3hjdrp2adl7tcalkavt9ly5g8q3zkymk'

BTCProcessor.bind({
  address: address,
  chainId: ChainId.BTC_MAINNET
}).onTransaction((tx, ctx) => {
  let amount = 0
  let from = ''
  let to = ''
  for (const o of tx.vout) {
    if (o.scriptpubkey_address == address) {
      amount = o.value
      to = address
      for (const input of tx.vin) {
        if (input.prevout.scriptpubkey_address != address) {
          from = input.prevout.scriptpubkey_address
        }
        ctx.eventLogger.emit('transfer', {
          distinctId: tx.txid,
          message: `transfer ${amount} from ${from} to ${to}`,
          from,
          to,
          amount
        })
      }
      break
    }
  }
})
