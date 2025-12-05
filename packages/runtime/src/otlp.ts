import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { diag, DiagConsoleLogger, DiagLogLevel, metrics } from '@opentelemetry/api'

export async function setupOTLP(debug?: boolean) {
  if (debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  const sdk = new NodeSDK({
    autoDetectResources: true,
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter()
      }),
      new PrometheusExporter({
        host: '0.0.0.0',
        port: 4041
      })
    ]
  })

  // sdk.start()
  ;['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal as any, () => sdk.shutdown().catch(console.error))
  })

  metrics.getMeter('processor').createGauge('up').record(1)
}
