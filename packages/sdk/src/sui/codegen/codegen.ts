import { Connection, JsonRpcProvider, SuiMoveNormalizedModules } from '@mysten/sui.js'

import { SuiNetwork } from '../network.js'
import * as fs from 'fs'
import chalk from 'chalk'
import { InternalMoveModule, InternalMoveStruct } from '../../move/internal-models.js'
import { AbstractCodegen } from '../../move/abstract-codegen.js'
import { toInternalModule } from '../move-types.js'
import { moduleQname, SPLITTER, structQname, TypeDescriptor } from '../../move/index.js'
import { getMeaningfulFunctionParams } from '../utils.js'

export async function codegen(abisDir: string, outDir = 'src/types/sui', genExample = false) {
  if (!fs.existsSync(abisDir)) {
    return
  }
  const gen = new SuiCodegen()
  const numFiles = await gen.generate(abisDir, outDir)
  console.log(chalk.green(`Generated ${numFiles} for Sui`))
}

function getRpcEndpoint(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return 'https://fullnode.testnet.sui.io/'
  }
  return 'https://fullnode.mainnet.sui.io/'
}

function getRpcClient(network: SuiNetwork): JsonRpcProvider {
  return new JsonRpcProvider(new Connection({ fullnode: getRpcEndpoint(network) }))
}

class SuiCodegen extends AbstractCodegen<SuiMoveNormalizedModules, SuiNetwork> {
  ADDRESS_TYPE = 'SuiAddress'
  MAIN_NET = SuiNetwork.MAIN_NET
  TEST_NET = SuiNetwork.TEST_NET
  PREFIX = 'Sui'
  STRUCT_FIELD_NAME = 'fields'
  GENERATE_ON_ENTRY = true

  async fetchModules(account: string, network: SuiNetwork): Promise<SuiMoveNormalizedModules> {
    const client = getRpcClient(network)
    return await client.getNormalizedMoveModulesByPackage({ package: account })
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return getMeaningfulFunctionParams(params)
  }

  toInternalModules(modules: SuiMoveNormalizedModules): InternalMoveModule[] {
    return Object.values(modules).map(toInternalModule)
  }

  getEventStructs(module: InternalMoveModule) {
    const qname = moduleQname(module)
    const eventMap = new Map<string, InternalMoveStruct>()

    for (const struct of module.structs) {
      const abilities = new Set(struct.abilities)
      if (abilities.has('Drop') && abilities.has('Copy')) {
        eventMap.set(qname + SPLITTER + struct.name, struct)
      }
    }
    return eventMap
  }

  readModulesFile(fullPath: string) {
    const res = super.readModulesFile(fullPath)
    if (res.result) {
      return res.result
    }
    return res
  }

  generateStructs(module: InternalMoveModule, struct: InternalMoveStruct, events: Set<string>): string {
    switch (structQname(module, struct)) {
      case '0x2::object::ID':
        return `export type ${struct.name} = string`
      case '0x2::coin::Coin':
        return `export type ${struct.name}<T> = string`
      case '0x1::option::Option':
        return `export type Option<T> = T | undefined`
    }
    return super.generateStructs(module, struct, events)
  }

  generateOnEvents(module: InternalMoveModule, struct: InternalMoveStruct): string {
    switch (structQname(module, struct)) {
      case '0x2::object::ID':
      case '0x2::coin::Coin':
      case '0x1::option::Option':
        return ''
    }
    return super.generateOnEvents(module, struct)
  }
}
