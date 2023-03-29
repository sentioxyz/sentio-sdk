import Ethers from '@sentio/ethers-v6'
import {
  Config,
  extractAbi,
  extractDocumentation,
  FileDescription,
  parse,
  shortenFullJsonFilePath,
  Contract,
} from 'typechain'
import { dirname, join, relative } from 'path'
import { codeGenIndex, codeGenSentioFile, codeGenTestUtilsFile } from './file.js'

export interface SentioEthersConfig extends Config {
  genUsage?: boolean
}

export default class EthersSentio extends Ethers.default {
  constructor(config: SentioEthersConfig) {
    if (!config.outDir) {
      throw new Error('Out put path not specificed')
    }
    super(config)
  }

  private processedContracts: Contract[] = []

  // TODO(pc): also have to override transformBinFile, transformFile
  override transformAbiOrFullJsonFile(file: FileDescription): FileDescription[] | void {
    const abi = extractAbi(file.contents)
    if (abi.length === 0) {
      return
    }

    const documentation = extractDocumentation(file.contents)

    const jsonPath = relative(this.cfg.inputDir, shortenFullJsonFilePath(file.path, this.cfg.allFiles))
    const contract = parse(abi, jsonPath, documentation)
    const files = super.transformAbiOrFullJsonFile(file)
    this.processedContracts.push(contract)

    if (files !== undefined) {
      // files.forEach(this.transformFilePath)
      // for (const file of files) {
      //   this.transformFilePath(file)
      // }

      return [
        ...files,
        {
          path: join(dirname(files[0].path), `${contract.name.toLowerCase()}-processor.ts`),
          contents: codeGenSentioFile(contract),
        },
        {
          path: join(dirname(files[0].path), '..', `${contract.name.toLowerCase()}.ts`),
          contents: codeGenIndex(contract),
        },
        {
          path: join(dirname(files[0].path), `${contract.name.toLowerCase()}-test-utils.ts`),
          contents: codeGenTestUtilsFile(contract),
        },
      ]
    }
  }

  override afterRun() {
    const files = super.afterRun()
    for (const [idx, file] of files.entries()) {
      if (file.path.endsWith('__factory.ts')) {
        file.contents = '// @ts-nocheck\n' + file.contents
      } else if (file.path.endsWith('factories/index.ts')) {
        file.contents = file.contents.replaceAll("__factory'", "__factory.js'")
      } else if (file.path.endsWith('_processor.ts')) {
      }
    }
    let indexContent = ''
    for (const contract of this.processedContracts) {
      indexContent =
        indexContent +
        `
            export * as ${contract.name.toLowerCase().replaceAll('-', '_')} from './${contract.name.toLowerCase()}.js'
            export { ${contract.name}Processor, ${
          contract.name
        }ProcessorTemplate } from './${contract.name.toLowerCase()}.js'
            `
    }
    files.push({
      path: join(dirname(files[0].path), '../index.ts'),
      contents: indexContent,
    })
    return files
  }
}
