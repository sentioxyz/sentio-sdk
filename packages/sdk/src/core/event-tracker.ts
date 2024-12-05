import { BaseContext } from './base-context.js'
import { EventTrackingResult, LogLevel } from '@sentio/protos'
import { MapStateStorage } from '@sentio/runtime'
import { NamedResultDescriptor } from './metadata.js'
import { normalizeAttribute } from './normalization.js'
import { Event } from './event-logger.js'

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
    unique: true
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

  trackEvent<T>(ctx: BaseContext, event: Event<T>) {
    const { distinctId, message, severity, ...payload } = event

    const res: EventTrackingResult = {
      message: message || '',
      severity: severity || LogLevel.INFO,
      metadata: ctx.getMetaData(this.name, {}),
      distinctEntityId: distinctId || '',
      attributes: normalizeAttribute(payload),
      runtimeInfo: undefined,
      noMetric: false,
      attributes2: undefined
    }
    ctx.update({ events: [res] })
  }
}
/** @deprecated */
// eslint-disable-next-line deprecation/deprecation
export class AccountEventTracker extends EventTracker {
  static DEFAULT_OPTIONS: TrackerOptions = {
    totalByDay: true,
    unique: true,
    distinctByDays: [1, 7, 30]
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
