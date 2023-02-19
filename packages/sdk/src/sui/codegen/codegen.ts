import { SuiNetwork } from '../network.js'
import * as fs from 'fs'
import chalk from 'chalk'
import { NeutralMoveModule, NeutralMoveStruct } from '../../move/neutral-models.js'
import { AbstractCodegen } from '../../move/abstract-codegen.js'
import { JsonRpcProvider, SuiMoveNormalizedModules } from '@mysten/sui.js'
import { toNeutralModule } from '../move-types.js'
import { moduleQname, SPLITTER, TypeDescriptor } from '../../move/index.js'

export async function codegen(abisDir: string, outDir = 'src/types/sui') {
  if (!fs.existsSync(abisDir)) {
    return
  }
  console.log(chalk.green('Generated Types for Sui'))
  const gen = new SuiCodeGen()
  await gen.generate(abisDir, outDir)
}

function getRpcEndpoint(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return 'https://fullnode.testnet.sui.io/'
  }
  return 'https://fullnode.mainnet.sui.io/'
}

function getRpcClient(network: SuiNetwork): JsonRpcProvider {
  return new JsonRpcProvider(getRpcEndpoint(network))
}

class SuiCodeGen extends AbstractCodegen<SuiMoveNormalizedModules, SuiNetwork> {
  ADDRESS_TYPE = 'SuiAddress'
  MAIN_NET = SuiNetwork.MAIN_NET
  TEST_NET = SuiNetwork.TEST_NET
  PREFIX = 'Sui'
  STRUCT_FIELD_NAME = 'fields'

  async fetchModules(account: string, network: SuiNetwork): Promise<SuiMoveNormalizedModules> {
    const client = getRpcClient(network)
    return await client.getNormalizedMoveModulesByPackage(account)
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return params.slice(0, params.length - 1)
  }

  toNeutral(modules: SuiMoveNormalizedModules): NeutralMoveModule[] {
    return Object.values(modules).map(toNeutralModule)
  }

  getEventStructs(module: NeutralMoveModule) {
    const qname = moduleQname(module)
    const eventMap = new Map<string, NeutralMoveStruct>()

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
}
