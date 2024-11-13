// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import Ethers from '@sentio/ethers-v6'
import {
  Config,
  extractAbi,
  extractDocumentation,
  FileDescription,
  parse,
  shortenFullJsonFilePath,
  Contract
} from 'typechain'
import { dirname, join, relative } from 'path'
import { codeGenIndex, codeGenSentioFile, codeGenTestUtilsFile } from './file.js'
import { YamlContractConfig } from '../../core/yaml-contract-config.js'
import { ChainId, EthChainId } from '@sentio/chain'

export interface SentioEthersConfig extends Config {
  contractsToGenExample: YamlContractConfig[]
}

export default class EthersSentio extends Ethers.default {
  constructor(config: SentioEthersConfig) {
    if (!config.outDir) {
      throw new Error('Out put path not specificed')
    }
    super(config)
  }

  private processedABIs: Contract[] = []

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
    this.processedABIs.push(contract)

    if (files !== undefined) {
      // files.forEach(this.transformFilePath)
      // for (const file of files) {
      //   this.transformFilePath(file)
      // }

      return [
        ...files,
        {
          path: join(dirname(files[0].path), `${contract.name.toLowerCase()}-processor.ts`),
          contents: codeGenSentioFile(contract)
        },
        {
          path: join(dirname(files[0].path), '..', `${contract.name.toLowerCase()}.ts`),
          contents: codeGenIndex(contract)
        },
        {
          path: join(dirname(files[0].path), `${contract.name.toLowerCase()}-test-utils.ts`),
          contents: codeGenTestUtilsFile(contract)
        }
      ]
    }
  }

  override afterRun(): FileDescription[] {
    const commonPath = join('internal', 'common.ts')
    const files = super.afterRun()
    for (const [idx, file] of files.entries()) {
      if (file.path.endsWith('__factory.ts')) {
        file.contents =
          `// @ts-nocheck
            import { newContract, newInterface } from '@sentio/sdk/eth'
            ` + file.contents.replaceAll('new Contract', 'newContract').replaceAll('new Interface', 'newInterface') // those to reduce processor bundle code size
      } else if (file.path.endsWith(join('factories', 'index.ts'))) {
        file.contents = file.contents.replaceAll("__factory'", "__factory.js'")
      } else if (file.path.endsWith('_processor.ts')) {
      } else if (file.path.endsWith(commonPath)) {
        file.contents = COMMON_CONTENT
      }
    }

    let indexContent = ''
    for (const contract of this.processedABIs) {
      const content = `
            export * as ${contract.name.toLowerCase().replaceAll('-', '_')} from './${contract.name.toLowerCase()}.js'
            export { ${contract.name}Processor, ${
              contract.name
            }ProcessorTemplate } from './${contract.name.toLowerCase()}.js'
            `
      indexContent += content
    }
    files.push({
      path: join(dirname(files[0].path), '../index.ts'),
      contents: indexContent
    })

    const rootDir = join(dirname(files[0].path), '../../..')

    const contractsToGenExample = (this.cfg as SentioEthersConfig).contractsToGenExample
    if (contractsToGenExample.length > 0) {
      const processors = this.processedABIs.map((abi) => `${abi.name}Processor`).join(',')
      let exampleContent = `
      import { EthChainId } from '@sentio/sdk/eth' 
      import { ${processors} } from './types/eth/index.js'`

      const ethChainIdValues = new Map<ChainId, string>()
      for (const [key, value] of Object.entries(EthChainId)) {
        ethChainIdValues.set(value, key)
      }

      for (const contract of contractsToGenExample) {
        const chainKey = ethChainIdValues.get(contract.chain)
        if (!chainKey) {
          continue
        }
        const content = `

${contract.name}Processor.bind({ address: '${contract.address}', network: EthChainId.${chainKey} })
  .onEvent((evt, ctx) => {
    ctx.meter.Counter('events').add(1, { name: evt.name })
    ctx.eventLogger.emit(evt.name, {
      ...evt.args.toObject(),
    })
})
`
        exampleContent += content
      }
      // .onAllTraces(function (trace, ctx) {
      //   const succeed = trace.error === undefined
      //   ctx.meter.Counter('trace_count').add(1, { name: trace.name, success: String(succeed) })
      //   if (succeed) {
      //     ctx.eventLogger.emit(trace.name, {
      //       distinctId: trace.action.from,
      //       ...trace.args.toObject(),
      //     })
      //   }
      // })

      files.push({
        path: join(rootDir, 'processor.eth.example.ts'),
        contents: exampleContent
      })
    }
    return files
  }
}

const COMMON_CONTENT = `/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

export type { TypedEvent, TypedEventFilter } from "@sentio/sdk/eth"
export type { PromiseOrValue } from '@sentio/sdk/core'
`
