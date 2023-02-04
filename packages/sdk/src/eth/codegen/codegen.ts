import { loadFileDescriptions, processOutput, skipEmptyAbis } from 'typechain/dist/typechain/io.js'
import * as fs from 'fs'
import { Config, DEFAULT_FLAGS, Services } from 'typechain'
import EthersSentio from './ethers-sentio.js'
import * as prettier from 'prettier'
import path from 'path'
import mkdirp from 'mkdirp'

export async function codegen(abisDir: string, outDir: string) {
  if (!fs.existsSync(abisDir)) {
    return
  }
  console.log('Generated', await codegenInternal(abisDir, outDir), 'files')
}

async function codegenInternal(abisDir: string, outDir: string): Promise<number> {
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
  const config: Config = {
    cwd: process.cwd(),
    flags: DEFAULT_FLAGS,
    inputDir: abisDir,
    target: '',
    outDir: outInternal,
    allFiles: allFiles,
    filesToProcess: allFiles,
  }
  const services: Services = {
    fs,
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
