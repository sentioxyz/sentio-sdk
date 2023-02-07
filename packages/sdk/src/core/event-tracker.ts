import { BaseContext } from './base-context.js'
import { EventTrackingResult } from '@sentio/protos'
import { NamedResultDescriptor } from './metadata.js'
import { MapStateStorage } from '@sentio/runtime'
import { normalizeAttribute } from './normalization.js'

export interface Event {
  // The unique identifier of main identity associate with an event
  // .e.g user id / toekn address / account address / contract address id
  //
  distinctId: string
  [key: string]: any
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
    const { distinctId, ...payload } = event

    const res: EventTrackingResult = {
      metadata: ctx.getMetaData(this.name, {}),
      distinctEntityId: distinctId,
      attributes: normalizeAttribute(payload),
      runtimeInfo: undefined,
      noMetric: false,
    }
    ctx._res.events.push(res)
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

export class BoundedEventTracker {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }

  track(eventName: string, event: Event) {
    const { distinctId, ...payload } = event
    const res: EventTrackingResult = {
      metadata: this.ctx.getMetaData(eventName, {}),
      distinctEntityId: distinctId,
      attributes: payload,
      runtimeInfo: undefined,
      noMetric: true,
    }
    this.ctx._res.events.push(res)
  }
}
