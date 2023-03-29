import * as fs from 'fs'
import { MoveModuleBytecode, toInternalModule } from '../move-types.js'
import { moduleQname, SPLITTER, TypeDescriptor } from '../../move/index.js'
import chalk from 'chalk'
import { AptosNetwork } from '../network.js'
import { AptosClient } from 'aptos-sdk'
import { getMeaningfulFunctionParams } from '../utils.js'
import { InternalMoveModule, InternalMoveStruct } from '../../move/internal-models.js'
import { AbstractCodegen } from '../../move/abstract-codegen.js'

export async function codegen(abisDir: string, outDir = 'src/types/aptos', genExample = false) {
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
  // GENERATED_CLIENT = true

  async fetchModules(account: string, network: AptosNetwork): Promise<MoveModuleBytecode[]> {
    const client = getRpcClient(network)
    return await client.getAccountModules(account)
  }

  toInternalModules(modules: MoveModuleBytecode[]): InternalMoveModule[] {
    return modules.flatMap((m) => (m.abi ? [toInternalModule(m)] : []))
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return getMeaningfulFunctionParams(params)
  }

  getEventStructs(module: InternalMoveModule) {
    const qname = moduleQname(module)
    const structMap = new Map<string, InternalMoveStruct>()
    const eventMap = new Map<string, InternalMoveStruct>()

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
