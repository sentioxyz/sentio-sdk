import * as fs from 'fs'
import { Event, MoveModuleBytecode, MoveResource } from '../move-types.js'
import chalk from 'chalk'
import { AptosNetwork } from '../network.js'
import { join } from 'path'
import { AptosChainAdapter } from '../aptos-chain-adapter.js'
import { AbstractCodegen } from '../../move/abstract-codegen.js'

export async function codegen(abisDir: string, outDir = join('src', 'types', 'aptos'), genExample = false) {
  if (!fs.existsSync(abisDir)) {
    return
  }
  const gen = new AptosCodegen()
  const numFiles = await gen.generate(abisDir, outDir)
  console.log(chalk.green(`Generated ${numFiles} for Aptos`))
}

class AptosCodegen extends AbstractCodegen<AptosNetwork, MoveModuleBytecode, Event | MoveResource> {
  ADDRESS_TYPE = 'Address'
  MAIN_NET = AptosNetwork.MAIN_NET
  TEST_NET = AptosNetwork.TEST_NET
  PREFIX = 'Aptos'

  constructor() {
    super(AptosChainAdapter.INSTANCE)
  }
}
