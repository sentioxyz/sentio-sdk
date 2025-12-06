import { IMetricReader, MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { diag, DiagConsoleLogger, DiagLogLevel, metrics } from '@opentelemetry/api'

export async function setupOTLP(debug?: boolean) {
  console.log('Setting up OTLP metrics, debug=', !!debug)
  if (debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  const readers: IMetricReader[] = [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 60000
    })
  ]
  if (debug) {
    readers.push(
      new PrometheusExporter({
        host: '0.0.0.0',
        port: 4041
      })
    )
  }
  const meterProvider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 60000
      })
    ]
  })

  metrics.setGlobalMeterProvider(meterProvider)
  ;['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal as any, () => meterProvider.forceFlush().catch(console.error))
  })

  metrics.getMeter('processor').createGauge('up').record(1)
}
