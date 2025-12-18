import { GLOBAL_CONFIG, Plugin, PluginManager } from '@sentio/runtime'
import { InitResponse, ProcessConfigResponse } from '@sentio/protos'

import { MetricState } from './meter.js'
import { ExporterState } from './exporter.js'
import { EventLoggerState } from './event-logger.js'
import { DatabaseSchemaState, mergeSchemas } from './database-schema.js'

export class CorePlugin extends Plugin {
  name: string = 'CorePlugin'

  async configure(config: ProcessConfigResponse): Promise<void> {
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

    const schemas = DatabaseSchemaState.INSTANCE.getValues()
    let mergedSources = mergeSchemas(schemas)

    // Append MemoryCacheItem schema when cache is enabled
    if (GLOBAL_CONFIG.cache?.enabled) {
      mergedSources += `
type MemoryCacheItem @cache(sizeMB: ${GLOBAL_CONFIG.cache.size || 100}) {
  id: ID!
  value: String!
}
`
    }

    if (mergedSources.trim().length > 0) {
      config.dbSchema = {
        gqlSchema: mergedSources
      }
    }
  }
}

PluginManager.INSTANCE.register(new CorePlugin())
