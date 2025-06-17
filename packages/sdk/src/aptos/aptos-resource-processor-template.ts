import { ListStateStorage, processMetrics } from '@sentio/runtime'
import { TemplateInstanceState } from '../core/template.js'
import { AptosResourcesContext } from './context.js'
import { AptosBindOptions } from './network.js'
import { AptosResourcesProcessor, DEFAULT_RESOURCE_FETCH_CONFIG } from './aptos-processor.js'
import { HandleInterval, MoveAccountFetchConfig } from '@sentio/protos'
import { MoveResource } from '@aptos-labs/ts-sdk'
import { PromiseOrVoid } from '../core/index.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { HandlerOptions } from './models.js'

export class AptosResourceProcessorTemplateState extends ListStateStorage<AptosResourceProcessorTemplate> {
  static INSTANCE = new AptosResourceProcessorTemplateState()
}

class Handler {
  type?: string
  checkpointInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handlerName: string
  handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid
  handlerOptions: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>
}

export class AptosResourceProcessorTemplate {
  id: number
  binds = new Set<string>()
  handlers: Handler[] = []

  constructor() {
    this.id = AptosResourceProcessorTemplateState.INSTANCE.getValues().length
    AptosResourceProcessorTemplateState.INSTANCE.addValue(this)
    return proxyProcessor(this)
  }

  createProcessor(options: AptosBindOptions): AptosResourcesProcessor {
    return AptosResourcesProcessor.bind(options)
  }

  bind(options: AptosBindOptions, ctx: AptosResourcesContext): void {
    options.network = options.network || ctx.network
    options.startVersion = options.startVersion || ctx.version
    const id = options.address

    const sig = [options.network, id].join('_')
    if (this.binds.has(sig)) {
      console.log(`Same object id can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.createProcessor(options)
    for (const h of this.handlers) {
      processor.onInterval(
        h.handler,
        h.timeIntervalInMinutes,
        h.checkpointInterval,
        h.type,
        h.handlerOptions,
        h.handlerName
      )
    }
    const config = processor.config

    ctx.update({
      states: {
        configUpdated: true
      }
    })
    TemplateInstanceState.INSTANCE.addValue({
      templateId: this.id,
      contract: {
        name: '',
        chainId: config.network,
        address: config.address,
        abi: ''
      },
      startBlock: config.startVersion,
      endBlock: 0n,
      baseLabels: config.baseLabels
    })

    processMetrics.processor_template_instance_count.add(1, {
      chain_id: options.network,
      template: this.constructor.name
    })
  }

  protected onInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    checkpointInterval: HandleInterval | undefined,
    type: string | undefined,
    handlerOptions?: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>
  ): this {
    this.handlers.push({
      handlerName: getHandlerName(),
      handler: handler,
      timeIntervalInMinutes: timeInterval,
      checkpointInterval: checkpointInterval,
      type,
      handlerOptions: { ...DEFAULT_RESOURCE_FETCH_CONFIG, ...handlerOptions }
    })
    return this
  }

  public onTimeInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    type?: string,
    handlerOptions?: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>
  ): this {
    return this.onInterval(
      handler,
      {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      },
      undefined,
      type,
      handlerOptions
    )
  }

  public onVersionInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    checkpointInterval = 100000,
    backfillCheckpointInterval = 400000,
    type?: string,
    handlerOptions?: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: checkpointInterval, backfillInterval: backfillCheckpointInterval },
      type,
      handlerOptions
    )
  }
}
