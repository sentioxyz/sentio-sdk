import * as fs from 'fs'
import chalk from 'chalk'
import path, { join } from 'path'
import { AptosCodegen as BaseAptosCodegen } from '@typemove/aptos/codegen'
import { InternalMoveModule, InternalMoveStruct } from '@typemove/move'
import { AptosNetwork, getRpcEndpoint } from '../network.js'
import { Event, MoveModuleBytecode, MoveResource } from '@aptos-labs/ts-sdk'
import { SharedNetworkCodegen } from '../../move/shared-network-codegen.js'

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
    this.moduleGenerator = new (class extends SharedNetworkCodegen<
      AptosNetwork,
      MoveModuleBytecode,
      Event | MoveResource
    > {
      ADDRESS_TYPE = 'MoveAddressType'
      SYSTEM_PACKAGE = '@sentio/sdk/aptos'
      PREFIX = 'Aptos'
      NETWORK = AptosNetwork
    })(network, this.chainAdapter)
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
      
      import { defaultMoveCoder } from "${this.defaultCoderPackage()}"
      import { Aptos, Account as AptosAccount, MoveAddressType, PendingTransactionResponse, InputGenerateTransactionOptions, MoveStructId } from '@aptos-labs/ts-sdk'`
    )
  }
  generateLoadAll(isSystem: boolean): string {
    return this.moduleGenerator.generateLoadAll(isSystem)
  }
}

const MAINNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MAIN_NET)
const TESTNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.TEST_NET)
const MOVEMENT_MAINNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MOVEMENT_MAIN_NET)
const M2_TESTNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MOVEMENT_TEST_NET)
const MOVEMENT_PROTO_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MOVEMENT_PORTO)

class AptosCodegen {
  async generate(srcDir: string, outputDir: string, builtin = false): Promise<number> {
    const num1 = await MAINNET_CODEGEN.generate(srcDir, outputDir, builtin)
    const num2 = await TESTNET_CODEGEN.generate(path.join(srcDir, 'testnet'), path.join(outputDir, 'testnet'), builtin)
    const num3 = await MOVEMENT_MAINNET_CODEGEN.generate(
      path.join(srcDir, 'movement-mainnet'),
      path.join(outputDir, 'movement-mainnet'),
      builtin
    )
    const num4 = await M2_TESTNET_CODEGEN.generate(
      path.join(srcDir, 'm2-testnet'),
      path.join(outputDir, 'm2-testnet'),
      builtin
    )
    const num5 = await MOVEMENT_PROTO_CODEGEN.generate(
      path.join(srcDir, 'movement-porto'),
      path.join(outputDir, 'movement-porto'),
      builtin
    )
    return num1 + num2 + num3 + num4 + num5
  }
}
