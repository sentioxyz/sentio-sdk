import { detectResources } from '@opentelemetry/resources'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { diag, DiagConsoleLogger, DiagLogLevel, metrics, trace, ProxyTracerProvider } from '@opentelemetry/api'

export async function setupOTLP(debug?: boolean) {
  if (debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  const resource = await detectResources()

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter()
      }),
      new PrometheusExporter({
        host: '0.0.0.0',
        port: 4041
      })
    ]
  })

  const traceProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())]
  })

  traceProvider.register()
  metrics.setGlobalMeterProvider(meterProvider)
  trace.setGlobalTracerProvider(traceProvider)
  ;['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal as any, () => shutdownProvider())
  })

  metrics.getMeter('processor').createGauge('up').record(1)
}

export async function shutdownProvider() {
  const traceProvider = trace.getTracerProvider()

  if (traceProvider instanceof ProxyTracerProvider) {
    const delegate = traceProvider.getDelegate()
    if (delegate instanceof NodeTracerProvider) {
      delegate.shutdown().catch(console.error)
    }
  }
  const meterProvider = metrics.getMeterProvider()
  if (meterProvider instanceof MeterProvider) {
    meterProvider.shutdown().catch(console.error)
  }
}
