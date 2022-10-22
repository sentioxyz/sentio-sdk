import { BaseContext } from './context'
import { DataDescriptor, EventTrackingResult } from '@sentio/sdk'

export interface Event {
  // The unique identifier of main identity associate with an event
  // .e.g user id / toekn address / account address / contract address id
  //
  distinctId: string
  payload?: Record<string, string>
}

export interface TrackerOptions {
  totalByDay?: boolean
  unique?: boolean
  distinctByDays?: number[]
}

// Track Event with an identity associate with it
export class EventTracker {
  static DEFAULT_OPTIONS: TrackerOptions = {
    totalByDay: true,
    unique: true,
  }

  static register(eventName: string, options?: TrackerOptions) {
    const tracker = new EventTracker(eventName, { ...EventTracker.DEFAULT_OPTIONS, ...options })
    global.PROCESSOR_STATE.eventTrackers.push(tracker)
    return tracker
  }

  eventName: string
  options: TrackerOptions
  protected constructor(eventName: string, options: TrackerOptions) {
    this.eventName = eventName
    this.options = options
  }

  trackEvent(ctx: BaseContext, event: Event) {
    const res: EventTrackingResult = {
      metadata: ctx.getMetaData(DataDescriptor.fromPartial({ name: this.eventName }), {}),
      distinctEntityId: event.distinctId,
      attributes: JSON.stringify({}),
      runtimeInfo: undefined,
    }
    ctx.events.push(res)
  }
}

export class AccountEventTracker extends EventTracker {
  static DEFAULT_OPTIONS: TrackerOptions = {
    totalByDay: true,
    unique: true,
    distinctByDays: [1, 7, 30],
  }

  static register(eventName?: string, options?: TrackerOptions) {
    if (eventName) {
      ;['user', eventName].join('.')
    } else {
      eventName = 'user'
    }
    const tracker = new AccountEventTracker(eventName, { ...AccountEventTracker.DEFAULT_OPTIONS, ...options })
    global.PROCESSOR_STATE.eventTrackers.push(tracker)
    return tracker
  }
}
