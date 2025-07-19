import { errorString, mergeProcessResults, Plugin, PluginManager } from '@sentio/runtime'
import {
  DataBinding,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'

import { SuiChainId } from '@sentio/chain'
import { SuiContext } from './context.js'
import { SuiPluginPart } from './sui-plugin-part.js'
import { IotaPluginPart } from '../iota/iota-plugin-part.js'

export class SuiPlugin extends Plugin {
  name: string = 'SuiPlugin'
  handlerRegister = new HandlerRegister()
  partitionManager = new PartitionHandlerManager()

  suiPart = new SuiPluginPart(this.handlerRegister, this.partitionManager)
  iotaPart = new IotaPluginPart(this.handlerRegister, this.partitionManager)

  async start(request: StartRequest): Promise<void> {
    await this.suiPart.start(request)
    await this.iotaPart.start(request)
  }

  async init(config: InitResponse) {
    await this.suiPart.init(config)
    await this.iotaPart.init(config)
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as any)
    await this.suiPart.configure(config)
    await this.iotaPart.configure(config)
  }

  supportedHandlers = [
    HandlerType.SUI_EVENT,
    HandlerType.SUI_CALL,
    HandlerType.SUI_OBJECT,
    HandlerType.SUI_OBJECT_CHANGE
  ]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        return this.processSuiEvent(request)
      case HandlerType.SUI_CALL:
        return this.processSuiFunctionCall(request)
      case HandlerType.SUI_OBJECT:
        return this.processSuiObject(request)
      case HandlerType.SUI_OBJECT_CHANGE:
        return this.processSuiObjectChange(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        if (!request.data?.suiEvent) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiEvent can't be empty")
        }
        data = request.data.suiEvent
        break
      case HandlerType.SUI_CALL:
        if (!request.data?.suiCall) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiCall can't be empty")
        }
        data = request.data.suiCall
        break
      case HandlerType.SUI_OBJECT:
        if (!request.data?.suiObject) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiObject can't be empty")
        }
        data = request.data.suiObject
        break
      case HandlerType.SUI_OBJECT_CHANGE:
        if (!request.data?.suiObjectChange) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiObjectChange can't be empty")
        }
        data = request.data.suiObjectChange
        break
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return {
      partitions
    }
  }

  async processSuiEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiEvent) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const event = binding.data.suiEvent

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlerRegister
          .getHandlerById(handlerId)(event)
          .catch((e: any) => {
            throw new ServerError(
              Status.INTERNAL,
              'error processing event: ' + JSON.stringify(event) + '\n' + errorString(e)
            )
          })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiCall) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Call can't be empty")
    }
    const call = binding.data.suiCall

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(handlerId)(call)
        .catch((e: any) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e)
          )
        })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiObject(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiObject) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Object can't be empty")
    }
    const object = binding.data.suiObject

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlerRegister
          .getHandlerById(handlerId)(object)
          .catch((e: any) => {
            throw new ServerError(
              Status.INTERNAL,
              'error processing object: ' + JSON.stringify(object) + '\n' + errorString(e)
            )
          })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiObjectChange(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiObjectChange) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Object change can't be empty")
    }
    const objectChange = binding.data.suiObjectChange

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlerRegister
          .getHandlerById(handlerId)(objectChange)
          .catch((e: any) => {
            throw new ServerError(
              Status.INTERNAL,
              'error processing object change: ' + JSON.stringify(objectChange) + '\n' + errorString(e)
            )
          })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new SuiPlugin())

const NoopContext = new SuiContext('', SuiChainId.SUI_MAINNET, '', new Date(), 0n, {} as any, 0, {})
