import Ethers from '@typechain/ethers-v5'
import { Config, extractAbi, extractDocumentation, FileDescription, parse, shortenFullJsonFilePath } from 'typechain'
import { dirname, join, relative } from 'path'
import { codeGenIndex, codeGenSentioFile, codeGenTestUtilsFile } from './codegen'

export default class EthersSentio extends Ethers {
  constructor(config: Config) {
    if (!config.outDir) {
      throw new Error('Out put path not specificed')
    }
    super(config)
  }

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

    if (files !== undefined) {
      // files.forEach(this.transformFilePath)
      // for (const file of files) {
      //   this.transformFilePath(file)
      // }

      return [
        ...files,
        {
          path: join(dirname(files[0].path), `${contract.name.toLowerCase()}_processor.ts`),
          contents: codeGenSentioFile(contract),
        },
        {
          path: join(dirname(files[0].path), '..', contract.name.toLowerCase(), 'index.ts'),
          contents: codeGenIndex(contract),
        },
        {
          path: join(dirname(files[0].path), '..', contract.name.toLowerCase(), 'test-utils.ts'),
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
      }
    }
    return files
  }
}
