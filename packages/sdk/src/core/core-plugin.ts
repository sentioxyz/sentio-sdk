import { Plugin, PluginManager } from '@sentio/runtime'
import { ProcessConfigResponse } from '@sentio/protos'

import { MetricState } from './meter.js'
import { ExporterState } from './exporter.js'
import { EventTrackerState } from './event-tracker.js'
import { TemplateInstanceState } from './template.js'

export class CorePlugin extends Plugin {
  name: string = 'CorePlugin'

  async configure(config: ProcessConfigResponse): Promise<void> {
    // This syntax is to copy values instead of using references
    config.templateInstances = [...TemplateInstanceState.INSTANCE.getValues()]

    for (const metric of MetricState.INSTANCE.getValues()) {
      config.metricConfigs.push({
        ...metric.config,
      })
    }

    // eslint-disable-next-line deprecation/deprecation
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
