import { BaseContext } from './base-context'
import { EventTrackingResult } from '../gen'
import { NamedResultDescriptor } from './metadata'
import { MapStateStorage } from '../state/state-storage'

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

export class EventTrackerState extends MapStateStorage<EventTracker> {
  static INSTANCE = new EventTrackerState()
}

// Track Event with an identity associate with it
export class EventTracker extends NamedResultDescriptor {
  static DEFAULT_OPTIONS: TrackerOptions = {
    totalByDay: true,
    unique: true,
  }

  static register(eventName: string, options?: TrackerOptions) {
    const tracker = new EventTracker(eventName, { ...EventTracker.DEFAULT_OPTIONS, ...options })
    return EventTrackerState.INSTANCE.getOrSetValue(eventName, tracker)
  }

  options: TrackerOptions
  protected constructor(eventName: string, options: TrackerOptions) {
    super(eventName)
    this.options = options
  }

  trackEvent(ctx: BaseContext, event: Event) {
    const res: EventTrackingResult = {
      metadata: ctx.getMetaData(this.name, {}),
      distinctEntityId: event.distinctId,
      attributes: JSON.stringify({}),
      runtimeInfo: undefined,
    }
    ctx.res.events.push(res)
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
      eventName = ['user', eventName].join('_')
    } else {
      eventName = 'user'
    }
    const tracker = new AccountEventTracker(eventName, { ...AccountEventTracker.DEFAULT_OPTIONS, ...options })
    return EventTrackerState.INSTANCE.getOrSetValue(eventName, tracker)
  }
}
