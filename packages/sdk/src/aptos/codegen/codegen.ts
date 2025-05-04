import * as fs from 'fs'
import chalk from 'chalk'
import path, { join } from 'path'
import { AptosCodegen as BaseAptosCodegen } from '@typemove/aptos/codegen'
import { InternalMoveModule, InternalMoveStruct } from '@typemove/move'
import { AptosNetwork, getRpcEndpoint } from '../network.js'
import { Event, MoveModuleBytecode, MoveResource } from '@aptos-labs/ts-sdk'
import { SharedNetworkCodegen } from '../../move/shared-network-codegen.js'
import { recursiveCodegen } from '../../core/codegen.js'

export async function codegen(
  abisDir: string,
  outDir = join('src', 'types', 'aptos'),
  genExample = false,
  builtin = false
) {
  if (!fs.existsSync(abisDir)) {
    return
  }
  const gen = new AptosCodegen()
  const numFiles = await gen.generate(abisDir, outDir, builtin)
  console.log(chalk.green(`Generated ${numFiles} for Aptos`))
}

class AptosNetworkCodegen extends BaseAptosCodegen {
  moduleGenerator: SharedNetworkCodegen<AptosNetwork, MoveModuleBytecode, Event | MoveResource>
  SYSTEM_PACKAGE = '@sentio/sdk/aptos'

  constructor(network: AptosNetwork) {
    const endpoint = getRpcEndpoint(network)
    super(endpoint)
    const generator = this

    this.moduleGenerator = new (class extends SharedNetworkCodegen<
      AptosNetwork,
      MoveModuleBytecode,
      Event | MoveResource
    > {
      ADDRESS_TYPE = 'MoveAddressType'
      SYSTEM_PACKAGE = '@sentio/sdk/aptos'
      PREFIX = 'Aptos'
      NETWORK = AptosNetwork

      protected generateExtra(address: string | undefined, module: InternalMoveModule): string {
        return generator.generateExtra(address, module)
      }

      generateStructs(module: InternalMoveModule, struct: InternalMoveStruct, events: Set<string>) {
        return generator.generateStructs(module, struct, events)
      }
    })(network, this.chainAdapter)
  }

  protected getGetDefaultCoder() {
    return `defaultMoveCoderForClient(client)`
  }
  generateModule(module: InternalMoveModule, allEventStructs: Map<string, InternalMoveStruct>) {
    return this.moduleGenerator.generateModule(module, allEventStructs)
  }

  generateImports() {
    return (
      this.moduleGenerator.generateImports() +
      `
      import { TypeDescriptor, ANY_TYPE } from "@typemove/move"
      import {
        MoveCoder, TypedEventInstance } from "@typemove/${this.PREFIX.toLowerCase()}"

      import { defaultMoveCoder, defaultMoveCoderForClient } from "${this.defaultCoderPackage()}"
      import { Aptos, Account as AptosAccount, MoveAddressType, PendingTransactionResponse, InputGenerateTransactionOptions, MoveStructId, InputViewFunctionData } from '@aptos-labs/ts-sdk'`
    )
  }
  generateLoadAll(isSystem: boolean): string {
    return this.moduleGenerator.generateLoadAll(isSystem)
  }
}

const MAINNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MAIN_NET)
const TESTNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.TEST_NET)
const MOVEMENT_MAINNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MOVEMENT_MAIN_NET)
const MOVEMENT_TESTNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MOVEMENT_TEST_NET)

class AptosCodegen {
  async generate(srcDir: string, outputDir: string, builtin = false): Promise<number> {
    let numFiles = 0
    const generators: [string, AptosNetworkCodegen][] = [
      ['', MAINNET_CODEGEN],
      ['testnet', TESTNET_CODEGEN],
      ['movement-mainnet', MOVEMENT_MAINNET_CODEGEN],
      ['movement-testnet', MOVEMENT_TESTNET_CODEGEN]
    ]

    for (const [network, gen] of generators) {
      const exclude = network ? [] : ['testnet', 'movement-mainnet', 'movement-testnet']
      numFiles += await recursiveCodegen(
        path.join(srcDir, network),
        path.join(outputDir, network),
        (src, dst) => gen.generate(src, dst, builtin),
        exclude
      )
    }
    return numFiles
  }
}
