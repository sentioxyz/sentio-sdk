import { AsyncLocalStorage } from 'node:async_hooks'
import { Attributes, Counter, metrics, Gauge, Histogram } from '@opentelemetry/api'

const getMeter = () => metrics.getMeter('processor')

class C {
  private _counter: Counter<Attributes>
  private value: number = 0

  constructor(private name: string) {}

  get counter(): Counter<Attributes> {
    if (!this._counter) {
      this._counter = getMeter().createCounter(this.name)
    }
    return this._counter
  }

  add(value: number, attributes?: Attributes) {
    this.counter.add(value, attributes)
    this.value += value
  }

  get() {
    return this.value
  }
}

class G {
  private _gauge: Gauge<Attributes>
  private value: number = 0

  constructor(private name: string) {}

  get gauge(): Gauge<Attributes> {
    if (!this._gauge) {
      this._gauge = getMeter().createGauge(this.name)
    }
    return this._gauge
  }

  record(value: number, attributes?: Attributes) {
    this.gauge.record(value, attributes)
    this.value = value
  }

  get() {
    return this.value
  }
}

class H {
  private _histogram: Histogram<Attributes>
  private value: number = 0

  constructor(private name: string) {}

  get histogram(): Histogram<Attributes> {
    if (!this._histogram) {
      this._histogram = getMeter().createHistogram(this.name)
    }
    return this._histogram
  }

  record(value: number, attributes?: Attributes) {
    this.histogram.record(value, attributes)
    this.value = value
  }

  get() {
    return this.value
  }
}

export const dbMetrics = {
  send_counts: {
    get: new C('store_get_send'),
    upsert: new C('store_upsert_send'),
    list: new C('store_list_send'),
    delete: new C('store_delete_send')
  },
  recv_counts: {
    get: new C('store_get_recv'),
    upsert: new C('store_upsert_recv'),
    list: new C('store_list_recv'),
    delete: new C('store_delete_recv')
  },
  request_times: {
    get: new C('store_get_time'),
    upsert: new C('store_upsert_time'),
    list: new C('store_list_time'),
    delete: new C('store_delete_time')
  },
  request_errors: {
    get: new C('store_get_error'),
    upsert: new C('store_upsert_error'),
    list: new C('store_list_error'),
    delete: new C('store_delete_error')
  },
  batched_total_count: new C('batched_total_count'),
  batched_request_count: new C('batched_request_count'),
  unsolved_requests: new G('store_unsolved_requests'),

  stats() {
    return {
      send_counts: {
        get: this.send_counts.get.get(),
        upsert: this.send_counts.upsert.get(),
        list: this.send_counts.list.get(),
        delete: this.send_counts.delete.get()
      },
      recv_counts: {
        get: this.recv_counts.get.get(),
        upsert: this.recv_counts.upsert.get(),
        list: this.recv_counts.list.get(),
        delete: this.recv_counts.delete.get()
      },
      request_times: {
        get: this.request_times.get.get(),
        upsert: this.request_times.upsert.get(),
        list: this.request_times.list.get(),
        delete: this.request_times.delete.get()
      },
      request_errors: {
        get: this.request_errors.get.get(),
        upsert: this.request_errors.upsert.get(),
        list: this.request_errors.list.get(),
        delete: this.request_errors.delete.get()
      },
      batched_total_count: this.batched_total_count.get(),
      batched_request_count: this.batched_request_count.get(),
      unsolved_requests: this.unsolved_requests.get(),
      average_request_time: {
        get: this.request_times.get.get() / this.send_counts.get.get(),
        upsert: this.request_times.upsert.get() / this.send_counts.upsert.get(),
        list: this.request_times.list.get() / this.send_counts.list.get()
      }
    }
  }
}

export const providerMetrics = {
  hit_count: new C('provider_hit_count'),
  miss_count: new C('provider_miss_count'),
  queue_size: new G('provider_queue_size'),
  stats() {
    return {
      hit_count: this.hit_count.get(),
      miss_count: this.miss_count.get(),
      queue_size: this.queue_size.get()
    }
  }
}

export const processMetrics = {
  process_binding_count: new C('process_binding_count'),
  process_binding_time: new C('process_binding_time'),
  process_binding_error: new C('process_binding_error'),
  process_eventemit_count: new C('process_eventemit_count'),
  process_metricrecord_count: new C('process_metricrecord_count'),
  process_pricecall_count: new C('process_pricecall_count'),
  processor_handler_duration: new H('processor_handler_duration'),
  processor_rpc_duration: new H('processor_rpc_duration'),
  processor_rpc_queue_duration: new H('processor_rpc_queue_duration'),
  processor_template_instance_count: new C('process_template_instance_count'),
  stats() {
    return {
      process_binding_count: this.process_binding_count.get(),
      process_binding_time: this.process_binding_time.get(),
      process_binding_error: this.process_binding_error.get(),
      process_eventemit_count: this.process_eventemit_count.get(),
      process_metricrecord_count: this.process_metricrecord_count.get(),
      process_pricecall_count: this.process_pricecall_count.get(),
      processor_handler_duration: this.processor_handler_duration.get(),
      processor_rpc_duration: this.processor_rpc_duration.get(),
      processor_rpc_queue_duration: this.processor_rpc_queue_duration.get(),
      processor_template_instance_count: this.processor_template_instance_count.get()
    }
  }
}

export const metricsStorage = new AsyncLocalStorage<string>()
