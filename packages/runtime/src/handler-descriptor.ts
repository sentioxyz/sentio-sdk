import { type DataBinding, type ProcessConfigResponse } from '@sentio/protos'

type HandlerList = Array<{ handlerId: number; handlerName: string }> | undefined

/**
 * Maps a handler id back to readable labels, for diagnostics.
 *
 * Built from the config the processor itself reports — the same data the driver uses
 * to label handlers — and rendered in the driver's own shape
 * (`controller.HandlerID.String()`: `<dataSourceID>#<dataSource>/<type>/<name>/<id>`,
 * where dataSourceID is the config's index and dataSource is `<Contract|Account>:<address>`).
 * Matching it means the label in an SDK error is the same string the user already sees
 * in driver logs and the datasource UI. The driver additionally prefixes dataSource
 * with `<chainType>:<chainId>:`, which the sdk side does not know — the chain is
 * reported separately by describeBinding.
 *
 * The contract address matters as much as the handler name: with processor templates
 * the same handler is bound once per instance, so the name alone cannot say *which*
 * instance misbehaved.
 *
 * A handler id maps to a *list* of labels, because it is only unique per config, not
 * per chain: ids restart at 0 for each one. Solana is where this bites — interval
 * handlers must be declared without an address (the driver rejects an address with an
 * interval config), so several of them share a chain with nothing but the config index
 * to tell them apart. Keeping one label per id would silently overwrite the first with
 * the second and blame the wrong handler; the index is part of the label precisely so
 * they stay distinguishable.
 *
 * Rebuilt on every configure, which is what keeps it current: handler ids are assigned
 * during configure (each chain's registry is cleared first, so it is idempotent), and a
 * template instance appearing at runtime forces a fresh getConfig — the driver needs
 * the new ids itself — so the snapshot cannot lag behind the ids in use.
 */
export class HandlerDescriptors {
  // chainId -> handlerId -> labels
  private byChain: Map<string, Map<number, string[]>> = new Map()

  /** Replace everything with labels derived from a freshly generated config. */
  build(config: ProcessConfigResponse): void {
    // Swap in one go: clearing first would let a describeBinding racing with a
    // getConfig see an empty map and degrade to bare ids for no reason.
    const built = new Map<string, Map<number, string[]>>()
    // dataSourceID is the config's index, numbered independently per collection —
    // exactly how the driver does it, with Contract/Account keeping the two apart.
    for (const [dataSourceID, contractConfig] of (config.contractConfigs ?? []).entries()) {
      const contract = contractConfig.contract
      ingest(built, contract?.chainId ?? '', dataSourceID, describeSource('Contract', contract?.address), [
        ['log', contractConfig.logConfigs],
        ['trace', contractConfig.traceConfigs],
        ['transaction', contractConfig.transactionConfig],
        ['interval', contractConfig.intervalConfigs],
        ['interval', intervalsOf(contractConfig.moveIntervalConfigs)],
        ['event', contractConfig.moveEventConfigs],
        ['call', contractConfig.moveCallConfigs],
        ['change', contractConfig.moveResourceChangeConfigs],
        ['transaction', contractConfig.fuelTransactionConfigs],
        ['transfer', contractConfig.assetConfigs],
        ['log', contractConfig.fuelReceiptConfigs],
        ['log', contractConfig.cosmosLogConfigs],
        ['event', contractConfig.starknetEventConfigs]
      ])
    }
    // Account processors report through a separate collection: ETH account handlers
    // and the Aptos/Sui/Iota resource, object and address handlers all live here, and
    // would otherwise degrade to a bare id despite the config naming them.
    for (const [dataSourceID, accountConfig] of (config.accountConfigs ?? []).entries()) {
      ingest(built, accountConfig.chainId, dataSourceID, describeSource('Account', accountConfig.address), [
        ['interval', accountConfig.intervalConfigs],
        ['interval', intervalsOf(accountConfig.moveIntervalConfigs)],
        ['call', accountConfig.moveCallConfigs],
        ['change', accountConfig.moveResourceChangeConfigs],
        ['log', accountConfig.logConfigs]
      ])
    }
    this.byChain = built
  }

  /** Every label registered for this id, most often exactly one. */
  get(chainId: string, handlerId: number): string[] {
    return this.byChain.get(chainId)?.get(handlerId) ?? []
  }
}

type Built = Map<string, Map<number, string[]>>

function ingest(
  built: Built,
  chainId: string,
  dataSourceID: number,
  source: string,
  groups: Array<[string, HandlerList]>
): void {
  for (const [type, list] of groups) {
    for (const handler of list ?? []) {
      const label = `${dataSourceID}#${source}/${type}/${handler.handlerName}/${handler.handlerId}`
      add(built, chainId, handler.handlerId, label)
    }
  }
}

function add(built: Built, chainId: string, handlerId: number, label: string): void {
  let forChain = built.get(chainId)
  if (!forChain) {
    forChain = new Map()
    built.set(chainId, forChain)
  }
  const labels = forChain.get(handlerId)
  if (!labels) {
    forChain.set(handlerId, [label])
  } else if (!labels.includes(label)) {
    labels.push(label)
  }
}

/**
 * The driver's dataSource tail: "Contract:0x66cc6a17…", or bare "Contract" when there
 * is no address — which `BuildDataSource` also omits, and which is the normal case for
 * an interval handler.
 */
function describeSource(srcType: 'Contract' | 'Account', address: string | undefined): string {
  const adjusted = address && address !== '*' ? address : ''
  return adjusted ? `${srcType}:${adjusted}` : srcType
}

function intervalsOf(configs: Array<{ intervalConfig?: { handlerId: number; handlerName: string } }> | undefined) {
  return (configs ?? [])
    .map((c) => c.intervalConfig)
    .filter((c): c is { handlerId: number; handlerName: string } => !!c)
}

/**
 * What actually triggered this run — block, checkpoint, slot, version — so a report
 * names a single reproducible occurrence rather than just "this handler, sometime".
 *
 * Most chains put this in structured fields, which are free to read. Only the EVM
 * variants carry it inside raw JSON, and parsing that is why the whole description is
 * resolved lazily: paying a JSON.parse per binding on the happy path, for data used
 * almost never, would be a bad trade.
 *
 * Returns undefined for anything it cannot read, rather than guessing.
 */
export function describeBindingData(binding: DataBinding): string | undefined {
  const data = binding.data?.value
  if (!data) {
    return undefined
  }
  try {
    switch (data.case) {
      // --- EVM: everything is inside raw JSON ---
      case 'ethBlock':
        return atBlock(JSON.parse(data.value.rawBlock))
      case 'ethLog': {
        const log = JSON.parse(data.value.rawLog)
        return join([atBlock(log), tx(log.transactionHash), num('log', log.logIndex)])
      }
      case 'ethTransaction': {
        const transaction = JSON.parse(data.value.rawTransaction)
        return join([atBlock(transaction), tx(transaction.hash)])
      }
      case 'ethTrace': {
        const trace = JSON.parse(data.value.rawTrace)
        return join([atBlock(trace), tx(trace.transactionHash)])
      }

      // --- Solana: slot, plus which program for an instruction. The program stands in
      // for the handler name here, which the config cannot supply (see describeBinding). ---
      case 'solInstruction':
        return join([
          `slot ${data.value.slot}`,
          data.value.programAccountId && `program ${data.value.programAccountId}`
        ])
      case 'solBlock':
        return `slot ${data.value.slot}`

      // --- Aptos: transaction version ---
      case 'aptEvent':
        return join([num('version', versionOf(data.value.rawTransaction)), num('event', data.value.eventIndex)])
      case 'aptCall':
        return num('version', versionOf(data.value.rawTransaction))
      case 'aptResource':
        return `version ${data.value.version}`

      // --- Sui/Iota: checkpoint, and the object or digest in question ---
      case 'suiEvent':
        return join([`checkpoint ${data.value.slot}`, num('event', data.value.eventSeq)])
      case 'suiCall':
        return `checkpoint ${data.value.slot}`
      case 'suiObject':
        return join([
          `checkpoint ${data.value.slot}`,
          data.value.objectId && `object ${data.value.objectId}`,
          data.value.objectVersion !== undefined && `version ${data.value.objectVersion}`
        ])
      case 'suiObjectChange':
        return join([`checkpoint ${data.value.slot}`, data.value.txDigest && `tx ${data.value.txDigest}`])

      // --- The rest carry nothing that pins down a single occurrence: fuelTransaction
      // and fuelBlock only hold a Struct and a timestamp, cosmosCall and starknetEvents
      // just raw payloads. Better to say nothing than to invent a locator. ---
      case 'fuelReceipt':
        return num('receipt', data.value.receiptIndex)
      case 'fuelBlock':
      case 'fuelTransaction':
      case 'cosmosCall':
      case 'starknetEvents':
        return undefined
      default:
        return undefined
    }
  } catch {
    // Never let a malformed payload displace the error being reported.
    return undefined
  }
}

/** Aptos raw transactions carry the ledger version as a decimal string. */
function versionOf(rawTransaction: string | undefined): unknown {
  return rawTransaction ? JSON.parse(rawTransaction).version : undefined
}

function tx(hash: unknown): string | undefined {
  return typeof hash === 'string' && hash ? `tx ${hash}` : undefined
}

/** JSON-RPC numbers are hex strings; structured ones are already decimal. */
function num(label: string, value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  const parsed = typeof value === 'string' ? Number.parseInt(value, value.startsWith('0x') ? 16 : 10) : Number(value)
  return Number.isFinite(parsed) ? `${label} ${parsed}` : undefined
}

function atBlock(raw: {
  number?: unknown
  blockNumber?: unknown
  hash?: string
  blockHash?: string
}): string | undefined {
  const number = num('block', raw.number ?? raw.blockNumber)
  const hash = raw.hash ?? raw.blockHash
  // Short hash prefix, matching how the driver renders a block summary.
  return join([number, hash && `hash ${String(hash).slice(0, 10)}`])
}

function join(parts: Array<string | undefined | false>): string | undefined {
  const kept = parts.filter((p): p is string => !!p)
  return kept.length ? kept.join(' ') : undefined
}
