import { SuiBindOptions } from '@sentio/sdk'
import { SuiBaseProcessor } from '@sentio/sdk'

// class TicTacToeProcessor extends SuiBaseProcessor {
//   static bind(options: SuiBindOptions): TicTacToeProcessor {
//     if (options && !options.name) {
//       options.name = 'TicTacToe'
//     }
//     return new TicTacToeProcessor(options)
//   }
// }

class SuiTransferProcessor extends SuiBaseProcessor {
  static bind(options: SuiBindOptions): SuiTransferProcessor {
    return new SuiTransferProcessor('SuiNameNFT', options)
  }
}

// 0x8629ac2dc318f83e0d3e06fdceb826c7c4cf4178
SuiTransferProcessor.bind({
  startBlock: 0,
  address: '0x8c869ce3233d200d42b03e708b97398d11b35799',
}).onTransaction((txn, ctx) => {
  if (txn.certificate.data.transactions && txn.certificate.data.transactions.length > 0) {
    for (const transaction of txn.certificate.data.transactions) {
      if (transaction.TransferSui && transaction.TransferSui.amount) {
        ctx.meter.Counter('Sui_transfer_total_amount').add(transaction.TransferSui.amount)
      }
    }
  }
})

// TicTacToeProcessor.bind({
//   startBlock: 159647,
//   address: '0xb8252513f0b9efaa3e260842c4b84d8ff933522d',
// }).onTransaction((txn, ctx) => {
//   if (txn.certificate.data.transactions && txn.certificate.data.transactions.length > 0) {
//     if (
//       txn.certificate.data.transactions[0].Call &&
//       txn.certificate.data.transactions[0].Call.package &&
//       txn.certificate.data.transactions[0].Call.package.objectId === '0xb8252513f0b9efaa3e260842c4b84d8ff933522d'
//     ) {
//       if (txn.effects.events) {
//         txn.effects.events.forEach((event: { newObject: { recipient: { AddressOwner: any } } }) => {
//           if (event.newObject) {
//             const owner = event.newObject.recipient.AddressOwner
//             if (owner && (owner.toString() as string).includes('0x1c27')) {
//               ctx.meter.Counter('win_count').add(1)
//             }
//           }
//         })
//       }
//     }
//   }
// })
