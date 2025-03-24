import { SuiMoveNormalizedModule, SuiEvent, SuiMoveObject } from '@mysten/sui/client'

import * as fs from 'fs'
import chalk from 'chalk'
import { InternalMoveModule, InternalMoveStruct, structQname } from '@typemove/move'
import { SuiCodegen as BaseSuiCodegen } from '@typemove/sui/codegen'
import path, { join } from 'path'
import { SharedNetworkCodegen } from '../../move/shared-network-codegen.js'
import { getRpcEndpoint, SuiNetwork } from '../network.js'
import { recursiveCodegen } from '../../core/codegen.js'

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

class SuiNetworkCodegen extends BaseSuiCodegen {
  moduleGenerator: SharedNetworkCodegen<SuiNetwork, SuiMoveNormalizedModule, SuiEvent | SuiMoveObject>
  SYSTEM_PACKAGE = '@sentio/sdk/sui'

  constructor(network: SuiNetwork) {
    const endpoint = getRpcEndpoint(network)
    super(endpoint)
    const generator = this
    this.moduleGenerator = new (class extends SharedNetworkCodegen<
      SuiNetwork,
      SuiMoveNormalizedModule,
      SuiEvent | SuiMoveObject
    > {
      ADDRESS_TYPE = 'string'
      PREFIX = 'Sui'
      SYSTEM_PACKAGE = '@sentio/sdk/sui'
      NETWORK = SuiNetwork

      generateStructs(module: InternalMoveModule, struct: InternalMoveStruct, events: Set<string>): string {
        let content = ''
        switch (structQname(module, struct)) {
          // TODO they should still have module code generated
          case '0x1::ascii::Char':
          case '0x1::ascii::String':
          case '0x2::object::ID':
            content += `export type ${struct.name} = string`
            break
          case '0x2::coin::Coin':
            content += `export type ${struct.name}<T> = string`
            break
          case '0x2::balance::Balance':
            content += `export type ${struct.name}<T> = bigint`
            break
          case '0x1::option::Option':
            content += `export type Option<T> = T | undefined`
            break
        }
        return content + super.generateStructs(module, struct, events, content !== '')
      }

      generateForOnEvents(module: InternalMoveModule, struct: InternalMoveStruct): string {
        switch (structQname(module, struct)) {
          case '0x1::ascii::Char':
          case '0x1::ascii::String':
          case '0x2::object::ID':
          case '0x2::coin::Coin':
          case '0x1::option::Option':
          case '0x2::balance::Balance':
            return ''
        }
        return super.generateForOnEvents(module, struct)
      }

      protected generateExtra(address: string | undefined, module: InternalMoveModule): string {
        return generator.generateExtra(address, module)
      }
    })(network, this.chainAdapter)
  }

  generateModule(module: InternalMoveModule, allEventStructs: Map<string, InternalMoveStruct>) {
    return this.moduleGenerator.generateModule(module, allEventStructs)
  }
  generateImports() {
    return super.generateImports() + this.moduleGenerator.generateImports()
  }
  generateLoadAll(isSystem: boolean): string {
    return this.moduleGenerator.generateLoadAll(isSystem)
  }
}
//
const MAINNET_CODEGEN = new SuiNetworkCodegen(SuiNetwork.MAIN_NET)
const TESTNET_CODEGEN = new SuiNetworkCodegen(SuiNetwork.TEST_NET)

class SuiCodegen {
  async generate(srcDir: string, outputDir: string, builtin = false): Promise<number> {
    let numFiles = 0
    const generators: [string, SuiNetworkCodegen][] = [
      ['', MAINNET_CODEGEN],
      ['testnet', TESTNET_CODEGEN]
    ]

    for (const [network, gen] of generators) {
      numFiles += await recursiveCodegen(path.join(srcDir, network), path.join(outputDir, network), (src, dst) =>
        gen.generate(src, dst, builtin)
      )
    }
    return numFiles
  }
}
