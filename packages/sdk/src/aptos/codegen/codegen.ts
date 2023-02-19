import * as fs from 'fs'
import { MoveModuleBytecode, toNeutralModule } from '../move-types.js'
import { moduleQname, SPLITTER, TypeDescriptor } from '../../move/index.js'
import chalk from 'chalk'
import { AptosNetwork } from '../network.js'
import { AptosClient } from 'aptos-sdk'
import { getMeaningfulFunctionParams } from '../utils.js'
import { NeutralMoveModule, NeutralMoveStruct } from '../../move/neutral-models.js'
import { AbstractCodegen } from '../../move/abstract-codegen.js'

export async function codegen(abisDir: string, outDir = 'src/types/aptos') {
  if (!fs.existsSync(abisDir)) {
    return
  }
  console.log(chalk.green('Generated Types for Aptos'))
  const gen = new AptosCodegen()
  await gen.generate(abisDir, outDir)
}

function getRpcEndpoint(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return 'https://testnet.aptoslabs.com/'
  }
  return 'https://mainnet.aptoslabs.com/'
}

function getRpcClient(network: AptosNetwork): AptosClient {
  return new AptosClient(getRpcEndpoint(network))
}

class AptosCodegen extends AbstractCodegen<MoveModuleBytecode[], AptosNetwork> {
  ADDRESS_TYPE = 'Address'
  MAIN_NET = AptosNetwork.MAIN_NET
  TEST_NET = AptosNetwork.TEST_NET
  PREFIX = 'Aptos'

  async fetchModules(account: string, network: AptosNetwork): Promise<MoveModuleBytecode[]> {
    const client = getRpcClient(network)
    return await client.getAccountModules(account)
  }

  toNeutral(modules: MoveModuleBytecode[]): NeutralMoveModule[] {
    return modules.flatMap((m) => (m.abi ? [toNeutralModule(m)] : []))
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return getMeaningfulFunctionParams(params)
  }

  getEventStructs(module: NeutralMoveModule) {
    const qname = moduleQname(module)
    const structMap = new Map<string, NeutralMoveStruct>()
    const eventMap = new Map<string, NeutralMoveStruct>()

    for (const struct of module.structs) {
      structMap.set(qname + SPLITTER + struct.name, struct)
    }

    for (const struct of module.structs) {
      for (const field of struct.fields) {
        const t = field.type
        if (t.qname === '0x1::event::EventHandle') {
          const event = t.typeArgs[0].qname
          const eventStruct = structMap.get(event)
          if (eventStruct) {
            eventMap.set(event, eventStruct)
          }
        }
      }
    }

    return eventMap
  }
}
