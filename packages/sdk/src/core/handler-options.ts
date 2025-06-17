/**
 * Function type that extracts a partition key from data.
 * @template D The data type to process
 */
export type PartitionHandler<D> = (data: D) => string | Promise<string>

/**
 * Handler options that extend fetch configuration with optional partitioning support.
 * @template F The fetch configuration type (e.g., EthFetchConfig, MoveFetchConfig)
 * @template D The data type that will be processed (e.g., Event, Transaction, Block)
 */
export type HandlerOptions<F, D> = Partial<F> & {
  /**
   * Optional partition key for data partitioning.
   * Can be a static string or a function that computes the key from the data.
   */
  partitionKey?: string | PartitionHandler<D>
}

/**
 * Merge two handler options, with the second options taking precedence over the first.
 * @param options1 First handler options
 * @param options2 Second handler options (takes precedence)
 * @returns Merged handler options
 */
export function mergeHandlerOptions<F, D>(
  options1?: HandlerOptions<F, D>,
  options2?: HandlerOptions<F, D>
): HandlerOptions<F, D> | undefined {
  if (!options1 && !options2) return undefined
  if (!options1) return options2
  if (!options2) return options1

  return {
    ...options1,
    ...options2,
    // For partitionKey, the second option takes precedence
    partitionKey: options2.partitionKey ?? options1.partitionKey
  }
}
