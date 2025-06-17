import {
  HandlerType,
  ProcessStreamResponse_Partitions_Partition,
  ProcessStreamResponse_Partitions_Partition_SysValue
} from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'

/**
 * Type for partition handler functions that can process any data type
 */
export type PartitionHandler = (request: any) => Promise<string | undefined>

/**
 * Generic manager for handling partition logic across all chain plugins.
 * Provides a unified interface for registering, storing, and processing partition handlers.
 * Chain-specific logic should remain in individual plugins.
 */
export class PartitionHandlerManager {
  private partitionHandlers: Map<HandlerType, Record<number, PartitionHandler>> = new Map()

  /**
   * Register a partition handler for a specific handler type and ID
   * @param handlerType The type of handler (e.g., HandlerType.ETH_LOG, HandlerType.APT_EVENT)
   * @param handlerId The unique ID for this handler instance
   * @param partitionHandler The partition handler function (optional)
   */
  registerPartitionHandler(handlerType: HandlerType, handlerId: number, partitionHandler?: PartitionHandler): void {
    if (partitionHandler) {
      const existingHandlers = this.partitionHandlers.get(handlerType) || {}
      existingHandlers[handlerId] = partitionHandler
      this.partitionHandlers.set(handlerType, existingHandlers)
    }
  }

  /**
   * Process partition logic for a specific handler type
   * @param handlerType The type of handler being processed
   * @param handlerIds Array of handler IDs to process
   * @param data The data to pass to partition handlers
   * @returns Record mapping handler IDs to partition results
   */
  async processPartitionForHandlerType(
    handlerType: HandlerType,
    handlerIds: number[],
    data: any
  ): Promise<Record<number, ProcessStreamResponse_Partitions_Partition>> {
    const result: Record<number, ProcessStreamResponse_Partitions_Partition> = {}

    for (const handlerId of handlerIds) {
      const partitionHandler = this.partitionHandlers.get(handlerType)?.[handlerId]
      if (partitionHandler && data) {
        try {
          const partitionValue = await partitionHandler(data)
          result[handlerId] = {
            userValue: partitionValue
          }
        } catch (error) {
          // If partition handler fails, fall back to unrecognized
          throw new ServerError(Status.INVALID_ARGUMENT, 'compute partition key failed, error:' + error.message)
        }
      } else {
        result[handlerId] = {
          sysValue: ProcessStreamResponse_Partitions_Partition_SysValue.UNRECOGNIZED
        }
      }
    }

    return result
  }

  /**
   * Clear all partition handlers (useful for testing or reinitialization)
   */
  clear(): void {
    this.partitionHandlers.clear()
  }

  /**
   * Get all registered handler types
   * @returns Array of handler types that have registered partition handlers
   */
  getRegisteredHandlerTypes(): HandlerType[] {
    return Array.from(this.partitionHandlers.keys())
  }

  /**
   * Get the number of registered handlers for a specific handler type
   * @param handlerType The handler type to check
   * @returns Number of registered handlers for this type
   */
  getHandlerCount(handlerType: HandlerType): number {
    return Object.keys(this.partitionHandlers.get(handlerType) || {}).length
  }
}
