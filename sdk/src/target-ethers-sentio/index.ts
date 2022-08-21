import Ethers from '@typechain/ethers-v5'
import { extractAbi, extractDocumentation, FileDescription, parse, shortenFullJsonFilePath } from 'typechain'
import { dirname, join, relative } from 'path'
import { codeGenSentioFile } from './codegen'

export default class EthersSentio extends Ethers {
  // TODO(pc): also have to override transformBinFile, transformFile
  override transformAbiOrFullJsonFile(file: FileDescription): FileDescription[] | void {
    const abi = extractAbi(file.contents)
    if (abi.length === 0) {
      return
    }

    const documentation = extractDocumentation(file.contents)

    const path = relative(this.cfg.inputDir, shortenFullJsonFilePath(file.path, this.cfg.allFiles))

    const contract = parse(abi, path, documentation)

    const files = super.transformAbiOrFullJsonFile(file)

    if (files !== undefined) {
      return [
        ...files,
        {
          path: join(dirname(files[0].path), `${contract.name.toLowerCase()}_processor.ts`),
          contents: codeGenSentioFile(contract),
        },
      ]
    }
  }
}
