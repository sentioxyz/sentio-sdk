import { Plugin, PluginManager } from '@sentio/runtime'
import { ProcessConfigResponse } from '@sentio/protos'

import { MetricState } from './meter'
import { EventTrackerState } from './event-tracker'
import { ExporterState } from './exporter'

export class CorePlugin extends Plugin {
  name: string = 'CorePlugin'

  async configure(config: ProcessConfigResponse): Promise<void> {
    // part 0, prepare metrics and event tracking configs
    for (const metric of MetricState.INSTANCE.getValues()) {
      config.metricConfigs.push({
        ...metric.config,
      })
    }

    for (const eventTracker of EventTrackerState.INSTANCE.getValues()) {
      config.eventTrackingConfigs.push({
        distinctAggregationByDays: eventTracker.options.distinctByDays || [],
        eventName: eventTracker.name,
        retentionConfig: undefined,
        totalByDay: eventTracker.options.totalByDay || false,
        totalPerEntity: undefined,
        unique: eventTracker.options.unique || false,
      })
    }

    for (const exporter of ExporterState.INSTANCE.getValues()) {
      config.exportConfigs.push({
        name: exporter.name,
        channel: exporter.channel,
      })
    }
  }
}

PluginManager.INSTANCE.register(new CorePlugin())
