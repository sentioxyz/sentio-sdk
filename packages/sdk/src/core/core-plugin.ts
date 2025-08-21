import { Plugin, PluginManager } from '@sentio/runtime'
import { InitResponse, ProcessConfigResponse } from '@sentio/protos'

import { MetricState, MetricStateNew } from './meter.js'
import { ExporterState } from './exporter.js'
import { TemplateInstanceState } from './template.js'
import { EventLoggerState } from './event-logger.js'
import { DatabaseSchemaState, mergeSchemas } from './database-schema.js'

export class CorePlugin extends Plugin {
  name: string = 'CorePlugin'

  async configure(config: ProcessConfigResponse): Promise<void> {
    // This syntax is to copy values instead of using references
    config.templateInstances = [...TemplateInstanceState.INSTANCE.getValues()]

    this.initStartupConfig(config)
  }

  async init(config: InitResponse): Promise<void> {
    this.initStartupConfig(config)
  }

  initStartupConfig(config: InitResponse | ProcessConfigResponse): void {
    for (const metric of MetricState.INSTANCE.getValues()) {
      config.metricConfigs.push({
        ...metric.config
      })
    }
    for (const metric of MetricStateNew.INSTANCE.getValues()) {
      config.metricConfigs.push({
        ...metric.config
      })
    }
    for (const event of EventLoggerState.INSTANCE.getValues()) {
      config.eventLogConfigs.push({
        ...event.config
      })
    }

    for (const exporter of ExporterState.INSTANCE.getValues()) {
      config.exportConfigs.push({
        name: exporter.name,
        channel: exporter.channel
      })
    }

    if (DatabaseSchemaState.INSTANCE.getValues().length > 0) {
      const schemas = DatabaseSchemaState.INSTANCE.getValues()
      const mergedSources = mergeSchemas(schemas)
      config.dbSchema = {
        gqlSchema: mergedSources
      }
    }
  }
}

PluginManager.INSTANCE.register(new CorePlugin())
