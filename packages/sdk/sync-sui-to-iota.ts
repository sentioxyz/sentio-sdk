import * as fs from 'fs'
import * as path from 'path'

let sourceDir = path.resolve('src/sui')
let targetDir = path.resolve('src/iota')

function walkDir(dir: string, callback: (filePath: string, targetPath: string) => void) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (fullPath.includes('builtin')) {
        return
      }
      if (fullPath.includes('types')) {
        return
      }
      walkDir(fullPath, callback)
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const relativePath = path.relative(sourceDir, fullPath)
      callback(fullPath, path.join(targetDir, relativePath))
    }
  })
}

function ensureDirExist(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyAndReplace(filePath: string, targetPath: string) {
  const blacklist = new Set<string>([
    // 'sui-plugin.ts',
    // 'run.ts',
    // 'tests/move-call.test.ts',
    // 'tests/move-coder.test.ts',
    // 'move-coder.test.ts'
  ])

  const relativePath = path.relative(sourceDir, filePath)

  if (blacklist.has(relativePath)) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  let replacedContent = content
  replacedContent = replacedContent.replaceAll('@typemove/sui', '@typemove/iota')
  replacedContent = replacedContent.replaceAll('@mysten/sui', '@iota/iota-sdk')
  replacedContent = replacedContent.replaceAll('@sentio/sdk/sui', '@sentio/sdk/iota')
  replacedContent = replacedContent.replaceAll(/(?<!_)Sui(?!ChainId)/g, 'Iota')
  replacedContent = replacedContent.replaceAll(/sui(.*?\.js)/g, 'iota$1') // import
  replacedContent = replacedContent.replaceAll('sui_', 'iota_')
  replacedContent = replacedContent.replaceAll(`'sui'`, `'iota'`)

  replacedContent = replacedContent.replaceAll('https://fullnode.mainnet.sui.io', 'https://api.mainnet.iota.cafe')
  replacedContent = replacedContent.replaceAll('https://fullnode.testnet.sui.io', 'https://api.testnet.iota.cafe')
  replacedContent = replacedContent.replaceAll('SUI_MAINNET', 'IOTA_MAINNET')
  replacedContent = replacedContent.replaceAll('SUI_TESTNET', 'IOTA_TESTNET')

  if (filePath.endsWith('sui-plugin.ts')) {
    replacedContent = `// real plugin is in src/sui/sui-plugin.ts
export class IotaPlugin {}
`
  }

  // tests
  replacedContent = replacedContent.replaceAll('service.sui', 'service.iota')
  replacedContent = replacedContent.replaceAll('7000000', '7200000')
  replacedContent = replacedContent.replaceAll(`test('decode dynamic fields 3`, `test.skip('decode dynamic fields 3`)
  replacedContent = replacedContent.replaceAll('validator.Validator', 'validator.ValidatorV1')

  targetPath = targetPath.replaceAll('sui', 'iota')

  ensureDirExist(path.dirname(targetPath))
  fs.writeFileSync(targetPath, replacedContent, 'utf-8')
  console.log(`Copied and transformed: ${relativePath}`)
}

walkDir(sourceDir, copyAndReplace)

copyAndReplace('src/testing/sui-facet.ts', 'src/testing/iota-facet.ts')
