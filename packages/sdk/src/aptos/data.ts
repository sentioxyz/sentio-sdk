import { Data_AptEvent, Data_AptCall, Data_AptResource } from '@sentio/protos'
import { UserTransactionResponse, MoveResource } from '@aptos-labs/ts-sdk'
import { MoveCoder, decodeResourceChange, ResourceChange } from '@typemove/aptos'

type Data_AptEvent_Ext = Data_AptEvent & {
  _tx?: UserTransactionResponse
  _event?: any
  _decodedEvent?: any
}

type Data_AptCall_Ext = Data_AptCall & {
  _tx?: UserTransactionResponse
  _decodedCall?: any
}

type Data_AptResource_Ext = Data_AptResource & {
  _resources?: MoveResource[]
  _decodedResources?: ResourceChange<any>[]
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

export class AptCall implements Data_AptCall {
  constructor(readonly data: Data_AptCall_Ext) {}

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

  async decodeCall(coder: MoveCoder) {
    if (!this.data._decodedCall) {
      const tx = this.transaction
      let payload = tx.payload
      if (payload.type === 'multisig_payload') {
        payload = (payload as any).transaction_payload ?? payload
      }
      this.data._decodedCall = await coder.decodeFunctionPayload(payload as any)
      return this.data._decodedCall
    }
    return this.data._decodedCall
  }
}

export class AptResource implements Data_AptResource {
  constructor(readonly data: Data_AptResource_Ext) {}

  get version(): bigint {
    return this.data.version
  }

  get timestampMicros(): bigint {
    return this.data.timestampMicros
  }

  get rawResources(): string[] {
    return this.data.rawResources
  }

  get resources(): MoveResource[] {
    if (!this.data._resources) {
      this.data._resources = this.data.rawResources.map((r) => JSON.parse(r) as MoveResource)
    }
    return this.data._resources
  }

  get timestamp(): Date {
    return new Date(Number(this.data.timestampMicros) / 1000)
  }

  async decodeResources<T>(coder: MoveCoder): Promise<ResourceChange<T>[]> {
    if (!this.data._decodedResources) {
      this.data._decodedResources = await decodeResourceChange<T>(this.resources, coder)
    }
    return this.data._decodedResources as ResourceChange<T>[]
  }
}
