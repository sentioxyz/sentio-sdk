import { loadFileDescriptions, processOutput, skipEmptyAbis } from 'typechain/dist/typechain/io.js'
import * as fs from 'fs'
import { DEFAULT_FLAGS, Services } from 'typechain'
import EthersSentio, { SentioEthersConfig } from './ethers-sentio.js'

import synchronizedPrettier from '@prettier/sync'
import path from 'path'
import { mkdirpSync } from 'mkdirp'
import { YamlContractConfig } from '../../core/yaml-contract-config.js'
import chalk from 'chalk'

export async function codegen(abisDir: string, outDir: string, contractsToGenExample: YamlContractConfig[] = []) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  const numFiles = await codegenInternal(abisDir, outDir, contractsToGenExample)
  console.log(chalk.green(`Generated ${numFiles} files for ETH`))
}

async function codegenInternal(
  abisDir: string,
  outDir: string,
  contractsToGenExample: YamlContractConfig[]
): Promise<number> {
  const allFiles = fs.readdirSync(abisDir)
  if (allFiles.length === 0) {
    return 0
  }
  let allABIFiles = []
  for (const f of allFiles) {
    if (f.toLowerCase().endsWith('.json')) {
      allABIFiles.push(path.resolve(abisDir, f))
    }
  }

  allABIFiles = skipEmptyAbis(allABIFiles)
  if (allABIFiles.length === 0) {
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
    allFiles: allABIFiles,
    filesToProcess: allABIFiles,
    contractsToGenExample: contractsToGenExample
  }
  const services: Services = {
    fs,
    // @ts-ignore for test
    // prettier: { format: (s) => s },
    prettier: synchronizedPrettier,
    mkdirp: mkdirpSync
  }
  let filesGenerated = 0

  const target = new EthersSentio(config)

  const fileDescriptions = loadFileDescriptions(services, config.filesToProcess)

  // @ts-ignore - no types
  filesGenerated += processOutput(services, config, await target.beforeRun())

  for (const fd of fileDescriptions) {
    // @ts-ignore - no types
    filesGenerated += processOutput(services, config, await target.transformFile(fd))
  }

  filesGenerated += processOutput(services, config, target.afterRun())

  return filesGenerated
}
