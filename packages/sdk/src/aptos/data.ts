import { Data_AptEvent } from '@sentio/protos'
import { UserTransactionResponse } from '@aptos-labs/ts-sdk'
import { MoveCoder } from '@typemove/aptos'

type Data_AptEvent_Ext = Data_AptEvent & {
  _tx?: UserTransactionResponse
  _event?: any
  _decodedEvent?: any
}

export class AptEvent implements Data_AptEvent {
  constructor(readonly data: Data_AptEvent_Ext) {}

  get rawEvent(): string {
    return this.data.rawEvent
  }
  get eventIndex(): number {
    return this.data.eventIndex
  }
  get rawTransaction(): string {
    return this.data.rawTransaction
  }

  get transaction() {
    if (!this.data._tx) {
      this.data._tx = JSON.parse(this.data.rawTransaction) as UserTransactionResponse
      if (this.data._tx.events == null) {
        this.data._tx.events = []
      }
    }
    return this.data._tx
  }

  get event() {
    if (!this.data._event) {
      this.data._event = JSON.parse(this.data.rawEvent)
    }
    return this.data._event
  }

  async decodeEvent(coder: MoveCoder) {
    if (!this.data._decodedEvent) {
      this.data._decodedEvent = await coder.decodeEvent<any>(this.event)
      return this.data._decodedEvent
    }
    return this.data._decodedEvent
  }
}
