import { SuiMoveNormalizedModule, SuiEvent, SuiMoveObject } from '@mysten/sui.js'

import { SuiNetwork } from '../network.js'
import * as fs from 'fs'
import chalk from 'chalk'
import { InternalMoveModule, InternalMoveStruct } from '../../move/internal-models.js'
import { AbstractCodegen } from '../../move/abstract-codegen.js'
import { structQname } from '../../move/index.js'
import { join } from 'path'
import { SuiChainAdapter } from '../sui-chain-adapter.js'

export async function codegen(
  abisDir: string,
  outDir = join('src', 'types', 'sui'),
  genExample = false,
  builtin = false
) {
  if (!fs.existsSync(abisDir)) {
    return
  }
  const gen = new SuiCodegen()
  const numFiles = await gen.generate(abisDir, outDir, builtin)
  console.log(chalk.green(`Generated ${numFiles} for Sui`))
}

class SuiCodegen extends AbstractCodegen<SuiNetwork, SuiMoveNormalizedModule, SuiEvent | SuiMoveObject> {
  ADDRESS_TYPE = 'SuiAddress'
  // ADDRESS_TYPE = 'string'
  MAIN_NET = SuiNetwork.MAIN_NET
  TEST_NET = SuiNetwork.TEST_NET
  PREFIX = 'Sui'
  // STRUCT_FIELD_NAME = 'fields'
  // GENERATE_ON_ENTRY = true
  PAYLOAD_OPTIONAL = true

  constructor() {
    super(new SuiChainAdapter())
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
      case '0x2::balance::Balance':
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
      case '0x2::balance::Balance':
        return ''
    }
    return super.generateOnEvents(module, struct)
  }
}
