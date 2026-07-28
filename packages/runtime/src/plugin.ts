import {
  type DataBinding,
  HandlerType,
  type PreparedData,
  type PreprocessResult,
  PreprocessResultSchema,
  type ProcessConfigResponse,
  type ProcessResult,
  ProcessResultSchema,
  type StartRequest,
  StartRequestSchema,
  type ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema,
  ProcessStreamResponse_Partitions_Partition_SysValue,
  type UpdateTemplatesRequest
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { IDataBindingContext, IStoreContext } from './db-context.js'
import { describeBindingData, HandlerDescriptors } from './handler-descriptor.js'
import { AsyncLocalStorage } from 'node:async_hooks'

export abstract class Plugin {
  name: string
  supportedHandlers: HandlerType[] = []

  async configure(config: ProcessConfigResponse, forChainId?: string): Promise<void> {}

  async start(start: StartRequest): Promise<void> {}

  async processBinding(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    return create(ProcessResultSchema)
  }

  async preprocessBinding(request: DataBinding, preprocessStore: { [k: string]: any }): Promise<PreprocessResult> {
    return create(PreprocessResultSchema)
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions: request.handlerIds.reduce(
        (acc, id) => ({
          ...acc,
          [id]: {
            value: {
              case: 'sysValue',
              value: ProcessStreamResponse_Partitions_Partition_SysValue.BLOCK_NUMBER
            }
          }
        }),
        {}
      )
    })
  }

  /**
   * method used by action server only
   * @param port
   */
  async startServer(port?: number): Promise<void> {}

  /**
   * method used by action server only
   */
  shutdownServer() {}
}

export class PluginManager {
  static INSTANCE = new PluginManager()

  dbContextLocalStorage = new AsyncLocalStorage<IDataBindingContext | IStoreContext | undefined>()
  plugins: Plugin[] = []
  typesToPlugin = new Map<HandlerType, Plugin>()
  /** Handler labels, refreshed from every config we generate. See describeBinding. */
  readonly handlerDescriptors = new HandlerDescriptors()

  register(plugin: Plugin) {
    if (this.plugins.find((p) => p.name === plugin.name)) {
      return
    }
    this.plugins.push(plugin)

    for (const handlerType of plugin.supportedHandlers) {
      const exsited = this.typesToPlugin.get(handlerType)
      if (exsited) {
        throw new Error(`Duplicate plugin for ${handlerType}: ${exsited.name} and ${plugin.name}`)
      }
      this.typesToPlugin.set(handlerType, plugin)
    }
  }

  async configure(config: ProcessConfigResponse): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.configure(config)
    }
    // The finished config is the only place that ties a handler id to its contract
    // address and name, so keep the derived labels in step with it.
    this.handlerDescriptors.build(config)
  }

  start(start: StartRequest, actionServerPort?: number) {
    return Promise.all(this.plugins.map((plugin) => plugin.start(start)))
  }

  startServer(port?: number) {
    return Promise.all(this.plugins.map((plugin) => plugin.startServer(port)))
  }

  shutdown() {
    this.plugins.forEach((plugin) => plugin.shutdownServer())
  }

  processBinding(
    request: DataBinding,
    preparedData: PreparedData | undefined,
    dbContext?: IDataBindingContext | IStoreContext
  ): Promise<ProcessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return this.dbContextLocalStorage.run(dbContext, () => {
      return plugin.processBinding(request, preparedData)
    })
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return plugin.partition(request)
  }

  /**
   * One-line identification of what a binding is processing, for diagnostics: the
   * driver-style handler labels (contract address included, so template instances are
   * distinguishable) plus what actually triggered this run. Never throws — callers are
   * error paths, where masking the original error would be worse than a vague label.
   *
   * Every handler id gets an entry, even ones with no label: a report that silently
   * omits a candidate handler is worse than one that says "handlerId 99" for the id it
   * cannot name. Bindings dispatched without per-handler config — Solana instructions,
   * for one — legitimately have no name to resolve, hence the handler type and chain
   * are always spelled out as the fallback identification.
   */
  describeBinding(request: DataBinding): string {
    const handlers = request.handlerIds.map((id) => {
      let label: string | undefined
      try {
        label = this.handlerDescriptors.get(request.chainId, id)
      } catch {
        // fall through to the bare id
      }
      return label ?? `handlerId ${id}`
    })
    const type = HandlerType[request.handlerType] ?? request.handlerType
    const who = handlers.length ? handlers.join(', ') : 'no handler id'
    const trigger = describeBindingData(request)
    const where = `${who} (${type} on chain ${request.chainId})`
    return trigger ? `${where} at ${trigger}` : where
  }

  preprocessBinding(
    request: DataBinding,
    preprocessStore: { [k: string]: any },
    dbContext?: IDataBindingContext | IStoreContext
  ): Promise<PreprocessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return this.dbContextLocalStorage.run(dbContext, () => {
      return plugin.preprocessBinding(request, preprocessStore)
    })
  }

  async updateTemplates(request: UpdateTemplatesRequest) {
    for (const plugin of this.plugins) {
      await plugin.start(
        create(StartRequestSchema, {
          templateInstances: request.templateInstances
        })
      )
    }
  }
}
