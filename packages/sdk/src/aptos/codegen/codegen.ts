import * as fs from 'fs'
import chalk from 'chalk'
import path, { join } from 'path'
import { AptosCodegen as BaseAptosCodegen } from '@typemove/aptos/codegen'
import { InternalMoveModule, InternalMoveStruct } from '@typemove/move'
import { AptosNetwork, getRpcEndpoint } from '../network.js'
import { MoveModuleBytecode, MoveResource, Event } from '@aptos-labs/ts-sdk'
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

  constructor(network: AptosNetwork) {
    const endpoint = getRpcEndpoint(network)
    super(endpoint)
    this.moduleGenerator = new (class extends SharedNetworkCodegen<
      AptosNetwork,
      MoveModuleBytecode,
      Event | MoveResource
    > {
      ADDRESS_TYPE = 'MoveAddressType'
      PREFIX = 'Aptos'
      SYSTEM_PACKAGE = '@typemove/aptos'

      generateNetworkOption(network: AptosNetwork): string {
        switch (network) {
          case AptosNetwork.MAIN_NET:
            return 'MAIN_NET'
          default:
            return 'TEST_NET'
        }
      }
    })(network, this.chainAdapter)
  }

  generateModule(module: InternalMoveModule, allEventStructs: Map<string, InternalMoveStruct>) {
    return this.moduleGenerator.generateModule(module, allEventStructs)
  }
  generateImports() {
    return (
      this.moduleGenerator.generateImports() +
      `import { Aptos, Account as AptosAccount, MoveAddressType, PendingTransactionResponse, InputGenerateTransactionOptions, MoveStructId } from '@aptos-labs/ts-sdk'`
    )
  }
  generateLoadAll(isSystem: boolean): string {
    return this.moduleGenerator.generateLoadAll(isSystem)
  }
}

const MAINNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.MAIN_NET)
const TESTNET_CODEGEN = new AptosNetworkCodegen(AptosNetwork.TEST_NET)

class AptosCodegen {
  async generate(srcDir: string, outputDir: string, builtin = false): Promise<number> {
    const num1 = await MAINNET_CODEGEN.generate(srcDir, outputDir, builtin)
    const num2 = await TESTNET_CODEGEN.generate(path.join(srcDir, 'testnet'), path.join(outputDir, 'testnet'), builtin)
    return num1 + num2
  }
}
