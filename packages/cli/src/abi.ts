import chalk from 'chalk'
import process from 'process'
import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import { AptosChainId, ChainId, SuiChainId } from '@sentio/chain'

import type { Aptos } from '@aptos-labs/ts-sdk'
import type { IotaClient } from '@iota/iota-sdk/client'
import type { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import { ReadKey } from './key.js'
import { Auth } from './commands/upload.js'
import { getApiUrl } from './utils.js'

// @typemove/sui v2 codegen consumes the gRPC ABI shape
// (`[{ address, module: { datatypes, functions } }]`). The JSON-RPC
// `getNormalizedMoveModulesByPackage` returns the legacy shape
// (`{ structs, exposedFunctions }`); convert it so downloaded Sui/Iota ABIs
// feed the codegen directly.
const MOVE_DATATYPE_KIND_STRUCT = 1
const MOVE_DATATYPE_KIND_ENUM = 2
const MOVE_VIS: Record<string, number> = { Private: 1, Public: 2, Friend: 3 }
const MOVE_TYPE = {
  Address: 1,
  Bool: 2,
  U8: 3,
  U16: 4,
  U32: 5,
  U64: 6,
  U128: 7,
  U256: 8,
  Vector: 9,
  Datatype: 10,
  TypeParam: 11
}
const MOVE_ABILITY: Record<string, number> = { Copy: 1, Drop: 2, Store: 3, Key: 4 }

function normalizedTypeToBody(t: any): any {
  if (typeof t === 'string') {
    const m: Record<string, number> = {
      Address: MOVE_TYPE.Address,
      Bool: MOVE_TYPE.Bool,
      U8: MOVE_TYPE.U8,
      U16: MOVE_TYPE.U16,
      U32: MOVE_TYPE.U32,
      U64: MOVE_TYPE.U64,
      U128: MOVE_TYPE.U128,
      U256: MOVE_TYPE.U256
    }
    if (m[t]) return { type: m[t], typeParameterInstantiation: [] }
    if (t.toLowerCase() === 'signer')
      return { type: MOVE_TYPE.Datatype, typeName: '0x0::signer::Signer', typeParameterInstantiation: [] }
    throw Error('unknown primitive type ' + t)
  }
  if ('Vector' in t) return { type: MOVE_TYPE.Vector, typeParameterInstantiation: [normalizedTypeToBody(t.Vector)] }
  if ('Struct' in t) {
    const s = t.Struct
    return {
      type: MOVE_TYPE.Datatype,
      typeName: `${s.address}::${s.module}::${s.name}`,
      typeParameterInstantiation: (s.typeArguments ?? []).map(normalizedTypeToBody)
    }
  }
  if ('TypeParameter' in t)
    return { type: MOVE_TYPE.TypeParam, typeParameter: t.TypeParameter, typeParameterInstantiation: [] }
  if ('Reference' in t || 'MutableReference' in t) return normalizedTypeToBody(t.Reference ?? t.MutableReference)
  throw Error('unknown type ' + JSON.stringify(t))
}

function normalizedParam(t: any): any {
  if (t && typeof t === 'object' && 'Reference' in t) return { reference: 1, body: normalizedTypeToBody(t.Reference) }
  if (t && typeof t === 'object' && 'MutableReference' in t)
    return { reference: 2, body: normalizedTypeToBody(t.MutableReference) }
  return { body: normalizedTypeToBody(t) }
}

function normalizedAbilities(s: any): number[] {
  return (Array.isArray(s) ? s : (s?.abilities ?? [])).map((a: string) => MOVE_ABILITY[a])
}

function normalizedTypeParameters(params: any[]): any[] {
  return (params ?? []).map((p: any) => ({ constraints: normalizedAbilities(p.constraints ?? p.abilities ?? p) }))
}

function normalizedStruct(name: string, s: any): any {
  return {
    name,
    kind: MOVE_DATATYPE_KIND_STRUCT,
    abilities: normalizedAbilities(s.abilities),
    typeParameters: normalizedTypeParameters(s.typeParameters),
    fields: (s.fields ?? []).map((f: any, i: number) => ({
      name: f.name,
      position: i,
      type: normalizedTypeToBody(f.type)
    })),
    variants: []
  }
}

function normalizedEnum(name: string, e: any): any {
  return {
    name,
    kind: MOVE_DATATYPE_KIND_ENUM,
    abilities: normalizedAbilities(e.abilities),
    typeParameters: normalizedTypeParameters(e.typeParameters),
    fields: [],
    variants: Object.entries(e.variants ?? {}).map(([vn, fl]: [string, any], i) => ({
      name: vn,
      position: i,
      fields: (fl as any[]).map((f, fi) => ({ name: f.name, position: fi, type: normalizedTypeToBody(f.type) }))
    }))
  }
}

function normalizedFunction(name: string, f: any): any {
  return {
    name,
    visibility: MOVE_VIS[f.visibility],
    isEntry: f.isEntry ?? false,
    typeParameters: (f.typeParameters ?? []).map((p: any) => ({
      constraints: normalizedAbilities(p.abilities ?? p.constraints ?? p)
    })),
    parameters: (f.parameters ?? []).map(normalizedParam),
    returns: (f.return ?? []).map(normalizedParam)
  }
}

function normalizedModule(name: string, m: any): any {
  return {
    name: m.name ?? name,
    datatypes: [
      ...Object.entries(m.structs ?? {}).map(([k, s]) => normalizedStruct(k, s)),
      ...Object.entries(m.enums ?? {}).map(([k, e]) => normalizedEnum(k, e))
    ],
    functions: Object.entries(m.exposedFunctions ?? {}).map(([k, f]) => normalizedFunction(k, f))
  }
}

// Convert the JSON-RPC normalized-modules shape (a `{ name: module }` map or an
// array of modules, optionally wrapped in `{ result }`) into the gRPC ABI array
// consumed by the v2 codegen. `fallbackAddress` fills in the package address of
// modules that don't carry one; modules that do keep their own.
export function normalizedModulesToAbi(
  modules: any,
  fallbackAddress?: string
): Array<{ address: string; module: any }> {
  const map = modules?.result ?? modules
  const entries: Array<[string, any]> = Array.isArray(map)
    ? map.map((m: any) => [m.name, m])
    : Object.entries(map ?? {})
  return entries.map(([n, m]) => {
    const address = m.address ?? fallbackAddress
    if (typeof address !== 'string' || address === '') {
      throw Error(`cannot resolve package address of module ${m.name ?? n}`)
    }
    return { address, module: normalizedModule(n, m) }
  })
}

function isLegacyNormalizedModule(m: any): boolean {
  return !!m && typeof m === 'object' && !Array.isArray(m) && ('exposedFunctions' in m || 'structs' in m)
}

// A Sui ABI saved by an older CLI (or by hand from a JSON-RPC response) is the
// raw `getNormalizedMoveModulesByPackage` result: a `{ moduleName: { structs,
// exposedFunctions, ... } }` map or an array of such modules (the pre-gRPC
// codegen read both through Object.values), optionally wrapped in `{ result }`.
// The v2 codegen (see comment at top of file) instead consumes the gRPC array
// shape (`[{ address, module }]`) produced by `normalizedModulesToAbi`. Feeding
// a legacy-shaped file straight to codegen throws (`modules.map is not a
// function` for the map, `Cannot read properties of undefined` for the array),
// so `sentio add`/`build`/`gen` fail whenever a stale Sui ABI is already
// sitting in `abis/sui`. Detect every legacy variant.
export function isLegacyNormalizedModules(parsed: any): boolean {
  const map = parsed?.result ?? parsed
  if (!map || typeof map !== 'object') {
    return false
  }
  return (Array.isArray(map) ? map : Object.values(map)).some(isLegacyNormalizedModule)
}

// A legacy-shaped Sui ABI file on disk together with its parsed content and the
// package address recovered from the 0x-prefixed file name (what `sentio add`
// uses by default), used for modules that don't carry their own address.
export interface LegacySuiAbi {
  file: string
  modules: any
  fallbackAddress?: string
}

// Recursively collect every legacy-shaped Sui ABI under `baseDir`. Pure/offline;
// the conversion happens in `convertLegacySuiAbis`. Iota still consumes the
// legacy shape, so this must only ever be pointed at the Sui directory.
export function collectLegacySuiAbis(baseDir: string): LegacySuiAbi[] {
  const result: LegacySuiAbi[] = []
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) {
      return
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }
      if (!entry.name.endsWith('.json')) {
        continue
      }
      let parsed: any
      try {
        parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      } catch {
        continue
      }
      if (!isLegacyNormalizedModules(parsed)) {
        continue
      }
      const base = path.basename(fullPath, '.json')
      result.push({ file: fullPath, modules: parsed, fallbackAddress: base.startsWith('0x') ? base : undefined })
    }
  }
  walk(baseDir)
  return result
}

// Sui ABIs saved by an older CLI are stored in the legacy JSON-RPC shape, which
// the current gRPC codegen can't read, so a stale Sui ABI left in `abis/sui`
// makes `sentio add`/`build`/`gen` fail for the whole project. Rewrite every
// such file in place through `normalizedModulesToAbi`. The legacy file already
// holds the full module ABI, so this is a pure local conversion: no network, no
// dependence on a hard-coded fullnode URL, and it also covers packages saved
// from networks the CLI can't re-download from.
export function convertLegacySuiAbis(baseDir = path.resolve('abis', 'sui')): void {
  const legacy = collectLegacySuiAbis(baseDir)
  if (legacy.length === 0) {
    return
  }
  console.log(chalk.yellow(`Found ${legacy.length} legacy Sui ABI file(s), converting to the current format`))
  for (const { file, modules, fallbackAddress } of legacy) {
    let abi: ReturnType<typeof normalizedModulesToAbi>
    try {
      abi = normalizedModulesToAbi(modules, fallbackAddress)
    } catch (e: any) {
      console.log(
        chalk.yellow(`Skipping legacy Sui ABI ${file}: ${e?.message ?? e}, re-download it with \`sentio add\``)
      )
      continue
    }
    fs.writeFileSync(file, JSON.stringify(abi, null, 2))
    console.log(chalk.green('Converted legacy Sui ABI', file))
  }
}

export async function getABI(
  chain: ChainId,
  address: string,
  name: string | undefined,
  credentials?: { apiKey?: string; token?: string; host?: string }
): Promise<{ name?: string; abi: object | string }> {
  const baseErrMsg = chalk.red(
    `Failed to automatic download contract ${address} from ${chain}, please manually download abi and put it into abis/eth directory`
  )

  // SUI
  try {
    const SuiJsonRpcClient = (await import('@mysten/sui/jsonRpc')).SuiJsonRpcClient
    let suiClient: SuiJsonRpcClient | undefined
    switch (chain) {
      case SuiChainId.SUI_MAINNET:
        suiClient = new SuiJsonRpcClient({ url: 'https://fullnode.mainnet.sui.io/', network: 'mainnet' })
        break
      case SuiChainId.SUI_TESTNET:
        suiClient = new SuiJsonRpcClient({ url: 'https://fullnode.testnet.sui.io/', network: 'testnet' })
        break
    }
    if (suiClient) {
      try {
        return {
          abi: normalizedModulesToAbi(await suiClient.getNormalizedMoveModulesByPackage({ package: address })),
          name
        }
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
  } catch (e) {
    console.log('sui module not loaded')
  }

  // Iota
  try {
    const IotaClient = (await import('@iota/iota-sdk/client')).IotaClient
    let iotaClient: IotaClient | undefined
    switch (chain) {
      case SuiChainId.IOTA_MAINNET:
        iotaClient = new IotaClient({ url: 'https://api.mainnet.iota.cafe/' })
        break
      case SuiChainId.IOTA_TESTNET:
        iotaClient = new IotaClient({ url: 'https://api.testnet.iota.cafe/' })
        break
    }
    if (iotaClient) {
      try {
        return {
          abi: await iotaClient.getNormalizedMoveModulesByPackage({ package: address }),
          name
        }
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
  } catch (e) {
    console.log('iota module not loaded')
  }

  // aptos
  try {
    const Aptos = (await import('@aptos-labs/ts-sdk')).Aptos
    const AptosConfig = (await import('@aptos-labs/ts-sdk')).AptosConfig
    const Network = (await import('@aptos-labs/ts-sdk')).Network

    let aptosClient: Aptos | undefined
    switch (chain) {
      case AptosChainId.APTOS_MAINNET:
        aptosClient = new Aptos(
          new AptosConfig({ network: Network.MAINNET, fullnode: 'https://mainnet.aptoslabs.com/v1' })
        )
        break
      case AptosChainId.APTOS_TESTNET:
        aptosClient = new Aptos(
          new AptosConfig({ network: Network.TESTNET, fullnode: 'https://testnet.aptoslabs.com/v1' })
        )
        break
      case AptosChainId.APTOS_MOVEMENT_TESTNET:
        aptosClient = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: 'https://aptos.testnet.bardock.movementlabs.xyz/v1'
          })
        )
        break
      case AptosChainId.APTOS_MOVEMENT_MAINNET:
        aptosClient = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: 'https://mainnet.movementnetwork.xyz/v1'
          })
        )
        break
      case AptosChainId.INITIA_ECHELON:
        aptosClient = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: 'https://rpc.sentio.xyz/initia-aptos/v1'
          })
        )
        break
    }
    if (aptosClient) {
      try {
        return {
          abi: await aptosClient.getAccountModules({ accountAddress: address }),
          name
        }
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
  } catch (e) {
    console.log('aptos module not loaded')
  }

  // ethereum
  try {
    const uploadAuth: Auth = {}
    const host = credentials?.host || 'https://app.sentio.xyz'
    let apiKey = ReadKey(host)
    if (credentials?.apiKey) {
      apiKey = credentials.apiKey
    }
    if (apiKey) {
      uploadAuth['api-key'] = apiKey
    } else if (credentials?.token) {
      uploadAuth.authorization = 'Bearer ' + credentials.token
    } else {
      const cmd = 'sentio login'
      console.error(chalk.red('No Credential found for', host, '. Please run `' + cmd + '`.'))
      process.exit(1)
    }
    const url = getApiUrl(`/api/v1/solidity/etherscan_abi?chainSpec.chainId=${chain}&address=${address}`, host)
    const resp = (await (
      await fetch(url, {
        headers: {
          ...uploadAuth
        }
      })
    ).json()) as any
    if (!resp.abi) {
      if (resp.message?.startsWith('contract source code not verified')) {
        throw Error(resp.message + "(API can't retrieve ABI based on similar contract)")
      }
      if (resp.message?.includes('unsupported')) {
        throw Error(`chain ${chain} not supported for direct add, please download the ABI manually`)
      }
      throw Error(resp.message)
    }
    return {
      abi: resp.abi,
      name: name ?? resp.contractName
    }
  } catch (e) {
    console.error(baseErrMsg, e)
    process.exit(1)
  }
}

export function getABIFilePath(chain: string, name: string, address?: string, folder?: string): string {
  let subpath
  const filename = name ?? address
  switch (chain) {
    case AptosChainId.APTOS_MAINNET:
      subpath = 'aptos'
      break
    case AptosChainId.APTOS_TESTNET:
      subpath = 'aptos/testnet'
      break
    case AptosChainId.APTOS_MOVEMENT_MAINNET:
      subpath = 'aptos/movement-mainnet'
      break
    case AptosChainId.APTOS_MOVEMENT_TESTNET:
      subpath = 'aptos/movement-testnet'
      break
    case AptosChainId.INITIA_ECHELON:
      subpath = 'aptos/initia-echelon'
      break
    case SuiChainId.SUI_MAINNET:
      subpath = 'sui'
      break
    case SuiChainId.SUI_TESTNET:
      subpath = 'sui/testnet'
      break
    case SuiChainId.IOTA_MAINNET:
      subpath = 'iota'
      break
    case SuiChainId.IOTA_TESTNET:
      subpath = 'iota/testnet'
      break
    default:
      subpath = 'eth'
  }

  if (folder) {
    if (folder.startsWith(subpath + '/')) {
      subpath = folder
    } else {
      console.log(
        chalk.red('ABI folder must be'),
        chalk.blue(subpath),
        chalk.red('or a folder inside', chalk.blue(subpath))
      )
      process.exit(1)
    }
  }

  return path.join('abis', subpath, filename + '.json')
}

export function writeABIFile(obj: string | object, output: string) {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }
  const data = JSON.stringify(obj, null, 2)

  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, data)
  console.log(chalk.green('ABI has been downloaded to', output))
}
