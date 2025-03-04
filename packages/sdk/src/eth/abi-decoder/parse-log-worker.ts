import { Interface, LogDescription, LogParams } from 'ethers'
import { ServerError, Status } from 'nice-grpc'
import { Piscina } from 'piscina'

export interface ILogDescription {
  topic: string
  args: {
    array?: any[]
    keys: string[]
  } | null
}

export function parseLog(contractViewInterface: any, log: LogParams): LogDescription | null {
  if (!log) {
    throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
  }
  const logParam = log as any as { topics: Array<string>; data: string }
  return contractViewInterface.parseLog(logParam)
}

export default ({ log }: { log: LogParams }): ILogDescription | null => {
  const fragments = Piscina['workerData']
  const contractViewInterface = new Interface(fragments)
  const result = parseLog(contractViewInterface, log)
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
