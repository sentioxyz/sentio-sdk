import { loadFileDescriptions, processOutput, skipEmptyAbis } from 'typechain/dist/typechain/io.js'
import * as fs from 'fs'
import { DEFAULT_FLAGS, Services } from 'typechain'
import EthersSentio, { SentioEthersConfig } from './ethers-sentio.js'
import * as prettier from 'prettier'
import path from 'path'
import mkdirp from 'mkdirp'
import { YamlContractConfig } from '../../core/yaml-contract-config.js'

export async function codegen(abisDir: string, outDir: string, contractsToGenExample: YamlContractConfig[] = []) {
  if (!fs.existsSync(abisDir)) {
    return
  }
  console.log('Generated', await codegenInternal(abisDir, outDir, contractsToGenExample), 'files')
}

async function codegenInternal(
  abisDir: string,
  outDir: string,
  contractsToGenExample: YamlContractConfig[]
): Promise<number> {
  let allFiles = fs.readdirSync(abisDir)
  if (allFiles.length === 0) {
    return 0
  }
  allFiles = allFiles.map((f) => path.resolve(abisDir, f))

  allFiles = skipEmptyAbis(allFiles)
  if (allFiles.length === 0) {
    return 0
  }
  const outInternal = path.resolve(outDir, 'internal')
  if (!fs.existsSync(outInternal)) {
    fs.mkdirSync(outInternal, { recursive: true })
  }

  // skip empty paths
  const config: SentioEthersConfig = {
    cwd: process.cwd(),
    flags: DEFAULT_FLAGS,
    inputDir: abisDir,
    target: '',
    outDir: outInternal,
    allFiles: allFiles,
    filesToProcess: allFiles,
    contractsToGenExample: contractsToGenExample,
  }
  const services: Services = {
    fs,
    // @ts-ignore for test
    // prettier: { format: (s) => s },
    prettier,
    mkdirp: mkdirp.sync,
  }
  let filesGenerated = 0

  const target = new EthersSentio(config)

  const fileDescriptions = loadFileDescriptions(services, config.filesToProcess)

  filesGenerated += processOutput(services, config, await target.beforeRun())

  for (const fd of fileDescriptions) {
    filesGenerated += processOutput(services, config, await target.transformFile(fd))
  }

  filesGenerated += processOutput(services, config, target.afterRun())

  return filesGenerated
}
