import { Interface, LogDescription, LogParams, ParamType, Result } from 'ethers'
import { Piscina } from 'piscina'
import { ServerError, Status } from 'nice-grpc'
import { FormattedLog } from '../eth.js'

export interface IResult {
  array?: any[]
  keys: string[]
}

export function decodeTraceInline(contractViewInterface: any, inputs: readonly ParamType[], traceData: string): Result {
  return contractViewInterface.getAbiCoder().decode(inputs, traceData, true)
}

export function decodeTrace({ inputs, traceData }: { inputs: ParamType[]; traceData: string }): IResult | null {
  const fragments = Piscina['workerData']
  const contractViewInterface = new Interface(fragments)
  const result = decodeTraceInline(contractViewInterface, inputs, traceData)

  const argsObj = result?.args.toObject(true)
  const argsArray: any[] = []
  const keys: string[] = []
  for (const [key, value] of Object.entries(argsObj)) {
    keys.push(key)
    argsArray.push(value)
  }

  return {
    array: argsArray,
    keys: keys
  }
}

export interface ILogDescription {
  topic: string
  args: {
    array?: any[]
    keys: string[]
  } | null
}

export function parseLogInline(contractViewInterface: any, log: LogParams): LogDescription | null {
  if (!log) {
    throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
  }
  const topics = log.topics
  const data = log.data
  return contractViewInterface.parseLog({ topics, data })
}

export function parseLog({ log }: { log: FormattedLog }): ILogDescription | null {
  const fragments = Piscina['workerData']
  const contractViewInterface = new Interface(fragments)
  if (log.raw) {
    log = new FormattedLog(log.raw)
  }
  const result = parseLogInline(contractViewInterface, log)
  if (!result) {
    return null
  }

  // can't serialize LogDescription, so return args and topics only
  if (result?.args == null) {
    return {
      args: null,
      topic: result.topic
    }
  }

  const argsObj = result?.args.toObject(true)
  const argsArray: any[] = []
  const keys: string[] = []
  for (const [key, value] of Object.entries(argsObj)) {
    keys.push(key)
    argsArray.push(value)
  }

  return {
    args: {
      array: argsArray,
      keys: keys
    },
    topic: result.topic
  }
}

export default {
  parseLog,
  decodeTrace
}
