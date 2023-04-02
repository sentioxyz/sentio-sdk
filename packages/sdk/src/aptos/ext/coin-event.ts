import { Event, Transaction_UserTransaction } from '../move-types.js'
import { Types } from 'aptos-sdk'
import { parseMoveType } from '../../move/index.js'

interface EventHandlerState {
  counter: string
  guid: {
    id: {
      addr: string
      creation_num: string
    }
  }
}

// TODO event handler name could be auto located from ABI
function findResourceChangeType(evt: Event, tx: Transaction_UserTransaction, eventHandlerName: string) {
  if (!tx.changes) {
    throw Error('No resource change found, did you forget set fetchOption to { resourceChanges: true  } ')
  }

  for (const change of tx.changes) {
    if (change.type !== 'write_resource') {
      continue
    }

    const writeResource = change as Types.WriteSetChange_WriteResource
    if (writeResource.address !== evt.guid.account_address) {
      continue
    }

    const state: EventHandlerState = (writeResource.data.data as any)[eventHandlerName]

    if (
      BigInt(state.counter) === BigInt(evt.sequence_number) + 1n &&
      state.guid.id.addr === evt.guid.account_address &&
      state.guid.id.creation_num === evt.guid.creation_number
    ) {
      return writeResource.data.type
    }
  }

  const errStr = `Can't find matched resource change type: ${JSON.stringify(evt.data)} ${
    tx.version
  } ${eventHandlerName}`
  throw Error(errStr)
}

export function getDepositCoinType(evt: Event, tx: Transaction_UserTransaction) {
  const coinStore = findResourceChangeType(evt, tx, 'deposit_events')
  return parseMoveType(coinStore).typeArgs[0].getSignature()
}

export function getWithDrawCoinType(evt: Event, tx: Transaction_UserTransaction) {
  const coinStore = findResourceChangeType(evt, tx, 'withdraw_events')
  return parseMoveType(coinStore).typeArgs[0].getSignature()
}
