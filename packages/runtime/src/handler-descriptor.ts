import { type ContractConfig, type DataBinding, type ProcessConfigResponse } from '@sentio/protos'

/**
 * Maps a handler id back to a readable label, for diagnostics.
 *
 * Built from the config the processor itself reports — which is the same data the
 * driver uses to label handlers (`controller.HandlerID`, rendered as
 * `<id>#<dataSource>/<type>/<name>`). Deriving ours from that one source means the
 * label in an SDK error matches what the user already sees in driver logs and the
 * datasource UI, instead of being a second, subtly different naming scheme.
 *
 * The contract address matters as much as the handler name: with processor
 * templates the same handler is bound once per instance, so the name alone cannot
 * say *which* instance misbehaved.
 */
export class HandlerDescriptors {
  // chainId -> handlerId -> label
  private byChain = new Map<string, Map<number, string>>()

  /** Replace everything with labels derived from a freshly generated config. */
  build(config: ProcessConfigResponse): void {
    this.byChain.clear()
    for (const contractConfig of config.contractConfigs ?? []) {
      const chainId = contractConfig.contract?.chainId ?? ''
      const source = describeSource(contractConfig)
      for (const [type, handlers] of handlersByType(contractConfig)) {
        for (const handler of handlers) {
          this.set(chainId, handler.id, `${handler.id}#${source}/${type}/${handler.name || 'unnamed'}`)
        }
      }
    }
  }

  get(chainId: string, handlerId: number): string | undefined {
    return this.byChain.get(chainId)?.get(handlerId)
  }

  private set(chainId: string, handlerId: number, label: string): void {
    let forChain = this.byChain.get(chainId)
    if (!forChain) {
      forChain = new Map()
      this.byChain.set(chainId, forChain)
    }
    forChain.set(handlerId, label)
  }
}

/** e.g. "TermMaxMarket:0x66cc6a17f93f2dc013dfcf8627ebd1269c20fd8f" */
function describeSource(contractConfig: ContractConfig): string {
  const contract = contractConfig.contract
  const address = contract?.address ?? '?'
  return contract?.name ? `${contract.name}:${address}` : address
}

type Handler = { id: number; name: string }

/**
 * The handler lists on a ContractConfig, tagged with the same type words the driver
 * uses ("log"/"trace"/"transaction"/"interval" for EVM, "event"/"call"/"change" for
 * Move, and so on) so both sides read alike.
 */
function handlersByType(contractConfig: ContractConfig): Array<[string, Handler[]]> {
  const pick = (list: Array<{ handlerId: number; handlerName: string }> | undefined): Handler[] =>
    (list ?? []).map((h) => ({ id: h.handlerId, name: h.handlerName }))

  return [
    ['log', pick(contractConfig.logConfigs)],
    ['trace', pick(contractConfig.traceConfigs)],
    ['transaction', pick(contractConfig.transactionConfig)],
    ['interval', pick(contractConfig.intervalConfigs)],
    // Move interval handlers wrap a plain OnIntervalConfig.
    ['interval', pick(contractConfig.moveIntervalConfigs?.map((c) => c.intervalConfig).filter((c) => !!c))],
    ['event', pick(contractConfig.moveEventConfigs)],
    ['call', pick(contractConfig.moveCallConfigs)],
    ['change', pick(contractConfig.moveResourceChangeConfigs)],
    ['transaction', pick(contractConfig.fuelTransactionConfigs)],
    ['transfer', pick(contractConfig.assetConfigs)],
    ['log', pick(contractConfig.fuelReceiptConfigs)],
    ['log', pick(contractConfig.cosmosLogConfigs)],
    ['event', pick(contractConfig.starknetEventConfigs)]
  ].filter(([, handlers]) => handlers.length > 0) as Array<[string, Handler[]]>
}

/**
 * What actually triggered this run — block, transaction, slot — so a report names a
 * single reproducible occurrence rather than just "this handler, sometime".
 *
 * The binding carries raw JSON (`raw_block`, `raw_log`, …), so this parses. That is
 * why it is called lazily, only when something is being reported: paying a JSON.parse
 * per binding on the happy path, for data used almost never, would be a bad trade.
 * Returns undefined for shapes it does not recognise rather than guessing.
 */
export function describeBindingData(binding: DataBinding): string | undefined {
  const data = binding.data?.value
  if (!data) {
    return undefined
  }
  try {
    switch (data.case) {
      case 'ethBlock':
        return atBlock(JSON.parse(data.value.rawBlock))
      case 'ethLog': {
        const log = JSON.parse(data.value.rawLog)
        return join([atBlock(log), log.transactionHash && `tx ${log.transactionHash}`, hexish('log', log.logIndex)])
      }
      case 'ethTransaction': {
        const tx = JSON.parse(data.value.rawTransaction)
        return join([atBlock(tx), tx.hash && `tx ${tx.hash}`])
      }
      case 'ethTrace': {
        const trace = JSON.parse(data.value.rawTrace)
        return join([
          trace.blockNumber !== undefined && `block ${trace.blockNumber}`,
          trace.transactionHash && `tx ${trace.transactionHash}`
        ])
      }
      case 'solInstruction':
        return `slot ${data.value.slot}`
      default:
        return undefined
    }
  } catch {
    // Never let a malformed payload displace the error being reported.
    return undefined
  }
}

/** JSON-RPC numbers are hex strings; entity/driver-shaped ones are already decimal. */
function hexish(label: string, value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  const n = typeof value === 'string' ? Number.parseInt(value, value.startsWith('0x') ? 16 : 10) : Number(value)
  return Number.isFinite(n) ? `${label} ${n}` : undefined
}

function atBlock(raw: { number?: unknown; blockNumber?: unknown; hash?: string; blockHash?: string }): string {
  const number = hexish('block', raw.number ?? raw.blockNumber)
  const hash = raw.hash ?? raw.blockHash
  // Short hash prefix, matching how the driver renders a block summary.
  return join([number, hash && `hash ${String(hash).slice(0, 10)}`]) ?? ''
}

function join(parts: Array<string | undefined | false>): string | undefined {
  const kept = parts.filter((p): p is string => !!p)
  return kept.length ? kept.join(' ') : undefined
}
