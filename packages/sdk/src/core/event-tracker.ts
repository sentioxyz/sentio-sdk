import { BaseContext } from './base-context.js'
import { EventTrackingResult, LogLevel } from '@sentio/protos'
import { MapStateStorage } from '@sentio/runtime'
import { NamedResultDescriptor } from './metadata.js'
import { normalizeAttribute } from './normalization.js'

export interface Event {
  // The unique identifier of main identity associate with an event
  // .e.g user id / token address / account address / contract address id
  //
  distinctId?: string
  severity?: LogLevel
  message?: string

  [key: string]: any
}

export class BoundedEventTracker {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }

  track(eventName: string, event: Event) {
    const { distinctId, severity, message, ...payload } = event

    const res: EventTrackingResult = {
      metadata: this.ctx.getMetaData(eventName, {}),
      severity: severity || LogLevel.INFO,
      message: message || '',
      distinctEntityId: distinctId || '',
      attributes: payload,
      runtimeInfo: undefined,
      noMetric: true,
    }
    this.ctx._res.events.push(res)
  }
}

export interface TrackerOptions {
  totalByDay?: boolean
  unique?: boolean
  distinctByDays?: number[]
}

/** @deprecated */
// eslint-disable-next-line deprecation/deprecation
export class EventTrackerState extends MapStateStorage<EventTracker> {
  // eslint-disable-next-line deprecation/deprecation
  static INSTANCE = new EventTrackerState()
}

// Track Event with an identity associate with it
/** @deprecated */
export class EventTracker extends NamedResultDescriptor {
  static DEFAULT_OPTIONS: TrackerOptions = {
    totalByDay: true,
    unique: true,
  }

  static register(eventName: string, options?: TrackerOptions) {
    // eslint-disable-next-line deprecation/deprecation
    const tracker = new EventTracker(eventName, { ...EventTracker.DEFAULT_OPTIONS, ...options })
    // eslint-disable-next-line deprecation/deprecation
    return EventTrackerState.INSTANCE.getOrSetValue(eventName, tracker)
  }

  options: TrackerOptions
  protected constructor(eventName: string, options: TrackerOptions) {
    super(eventName)
    this.options = options
  }

  trackEvent(ctx: BaseContext, event: Event) {
    const { distinctId, message, severity, ...payload } = event

    const res: EventTrackingResult = {
      message: message || '',
      severity: severity || LogLevel.INFO,
      metadata: ctx.getMetaData(this.name, {}),
      distinctEntityId: distinctId || '',
      attributes: normalizeAttribute(payload),
      runtimeInfo: undefined,
      noMetric: false,
    }
    ctx._res.events.push(res)
  }
}
/** @deprecated */
// eslint-disable-next-line deprecation/deprecation
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
    // eslint-disable-next-line deprecation/deprecation
    const tracker = new AccountEventTracker(eventName, { ...AccountEventTracker.DEFAULT_OPTIONS, ...options })
    // eslint-disable-next-line deprecation/deprecation
    return EventTrackerState.INSTANCE.getOrSetValue(eventName, tracker)
  }
}
