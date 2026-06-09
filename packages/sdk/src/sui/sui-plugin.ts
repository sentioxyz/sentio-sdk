import { errorString, mergeProcessResults, Plugin, PluginManager } from '@sentio/runtime'
import {
  type DataBinding,
  HandlerType,
  type InitResponse,
  type ProcessConfigResponse,
  type ProcessResult,
  type ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema,
  type StartRequest
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'

import { ConnectError, Code } from '@connectrpc/connect'
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
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        if (request.data?.value.case !== 'suiEvent') {
          throw new ConnectError("suiEvent can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.SUI_CALL:
        if (request.data?.value.case !== 'suiCall') {
          throw new ConnectError("suiCall can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.SUI_OBJECT:
        if (request.data?.value.case !== 'suiObject') {
          throw new ConnectError("suiObject can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.SUI_OBJECT_CHANGE:
        if (request.data?.value.case !== 'suiObjectChange') {
          throw new ConnectError("suiObjectChange can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions
    })
  }

  async processSuiEvent(binding: DataBinding): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'suiEvent') {
      throw new ConnectError("Event can't be empty", Code.InvalidArgument)
    }
    const promises: Promise<ProcessResult>[] = []
    const event = binding.data.value.value

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlerRegister
          .getHandlerById(
            binding.chainId,
            handlerId
          )(event)
          .catch((e: any) => {
            throw new ConnectError(
              'error processing event: ' + JSON.stringify(event) + '\n' + errorString(e),
              Code.Internal
            )
          })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'suiCall') {
      throw new ConnectError("Call can't be empty", Code.InvalidArgument)
    }
    const call = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(call)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e),
            Code.Internal
          )
        })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiObject(binding: DataBinding): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'suiObject') {
      throw new ConnectError("Object can't be empty", Code.InvalidArgument)
    }
    const object = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlerRegister
          .getHandlerById(
            binding.chainId,
            handlerId
          )(object)
          .catch((e: any) => {
            throw new ConnectError(
              'error processing object: ' + JSON.stringify(object) + '\n' + errorString(e),
              Code.Internal
            )
          })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiObjectChange(binding: DataBinding): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'suiObjectChange') {
      throw new ConnectError("Object change can't be empty", Code.InvalidArgument)
    }
    const objectChange = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlerRegister
          .getHandlerById(
            binding.chainId,
            handlerId
          )(objectChange)
          .catch((e: any) => {
            throw new ConnectError(
              'error processing object change: ' + JSON.stringify(objectChange) + '\n' + errorString(e),
              Code.Internal
            )
          })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new SuiPlugin())

const NoopContext = new SuiContext('', SuiChainId.SUI_MAINNET, '', new Date(), 0n, {} as any, 0, {})
