import { envDetector } from '@opentelemetry/resources'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { metrics, trace } from '@opentelemetry/api'

export async function setupOTLP() {
  const resource = await envDetector.detect()

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter()
      }),
      new PrometheusExporter({
        // http://localhost:4041/metrics
        port: 4041
      })
    ]
  })

  const traceProvider = new NodeTracerProvider({
    resource: resource
  })
  const exporter = new OTLPTraceExporter() // new ConsoleSpanExporter();
  const processor = new BatchSpanProcessor(exporter)
  traceProvider.addSpanProcessor(processor)
  traceProvider.register()

  metrics.setGlobalMeterProvider(meterProvider)
  trace.setGlobalTracerProvider(traceProvider)
  ;['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal as any, () => shutdownProvider())
  })
}

export async function shutdownProvider() {
  const traceProvider = trace.getTracerProvider()
  if (traceProvider instanceof NodeTracerProvider) {
    traceProvider.shutdown().catch(console.error)
  }
  const meterProvider = metrics.getMeterProvider()
  if (meterProvider instanceof MeterProvider) {
    meterProvider.shutdown().catch(console.error)
  }
}
