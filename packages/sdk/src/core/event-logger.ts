import { BaseContext } from './base-context.js'
import { EventTrackingResult, LogLevel } from '@sentio/protos'
import { NamedResultDescriptor } from './metadata.js'
import { normalizeAttribute } from './normalization.js'
import { Event } from './event-tracker.js'

export type Attributes = Record<string, any>

export class EventLogger extends NamedResultDescriptor {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext, name = '') {
    super(name)
    this.ctx = ctx
  }

  withName(name: string) {
    return new EventLogger(this.ctx, name)
  }

  emit(eventName: string, event: Event) {
    const { distinctId, severity, message, ...payload } = event

    const res: EventTrackingResult = {
      metadata: this.ctx.getMetaData(eventName, {}),
      severity: severity || LogLevel.INFO,
      message: message || '',
      distinctEntityId: distinctId || '',
      attributes: normalizeAttribute(payload),
      runtimeInfo: undefined,
      noMetric: true,
    }
    this.ctx._res.events.push(res)
  }
}
