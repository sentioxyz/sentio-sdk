import { Command } from 'commander'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import solc from 'solc'
import { getFinalizedHost } from '../config.js'
import { ReadKey } from '../key.js'
import chalk from 'chalk'
import { Auth } from './upload.js'
import { URL } from 'url'

const SRC_ROOT = 'src'

interface Metadata {
  solidityVersion: string
  contractName: string
  constructorArgs: string
  settings: any
}

export function createCompileCommand() {
  return new Command('compile')
    .description('Compile the processor')
    .option('--upload', '(Optional) Upload to sentio if compiled successfully')
    .option('--project <project>', '(Optional) Project full name, required in uploading')
    .option(
      '--api-key <key>',
      '(Optional) Manually provide API key rather than use saved credential, if both api-key and jwt-token is provided, use api-key.'
    )
    .option(
      '--token <token>',
      '(Optional) Manually provide token rather than use saved credential, if both api-key and token is provided, use api-key.'
    )
    .option('--host <host>', '(Optional) Sentio Host name')
    .action(async (options) => {
      await runCompileInternal(options)
    })
}

// export async function runCompile(argv: string[]) {
//   const program = new Command()
//
//   program
//     .option('--upload', '(Optional) Upload to sentio if compiled successfully')
//     .option('--project <project>', '(Optional) Project full name, required in uploading')
//     .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
//     .option('--token <token>', '(Optional) Manually provide token rather than use saved credential')
//     .option('--host <host>', '(Optional) Sentio Host name')
//     .parse(argv, { from: 'user' })
//
//   const options = program.opts()
//
//   await runCompileInternal(options)
// }

async function runCompileInternal(options: any) {
  let projectOwner, projectSlug
  const auth: Auth = {}
  if (options.upload) {
    if (!options.project) {
      console.error('Project full path is required for upload. Please specify by --project option.')
      process.exit(1)
    }
    ;[projectOwner, projectSlug] = options.project.includes('/')
      ? options.project.split('/')
      : [undefined, options.project]
    options.host = getFinalizedHost(options.host)

    let apiKey = ReadKey(options.host)
    if (options.apiKey) {
      apiKey = options.apiKey
    }
    if (apiKey) {
      auth['api-key'] = apiKey
    } else if (options.token) {
      auth.authorization = 'Bearer ' + options.token
    } else {
      const isProd = options.host === 'https://app.sentio.xyz'
      const cmd = isProd ? 'sentio login' : 'sentio login --host=' + options.host
      console.error(chalk.red('No Credential found for', options.host, '. Please run `' + cmd + '`.'))
      process.exit(1)
    }
  }

  let metadata: Metadata
  const mdPath = path.join(process.cwd(), 'metadata.json')
  try {
    metadata = JSON.parse(fs.readFileSync(mdPath, 'utf8'))
  } catch (e) {
    console.error('Unable to read metadata, please check if you are in a valid project directory.')
    process.exit(1)
  }

  const ver = metadata.solidityVersion
  let compiler: solc.Compiler
  try {
    const loadRemote = promisify(solc.loadRemoteVersion)
    compiler = await loadRemote(ver)
  } catch (e) {
    console.error(`Failed to fetch solc ${ver}:`, e)
    return false
  }
  console.log('Successfully fetch solc, compiling...')

  const input = prepareCompilerInput(metadata, SRC_ROOT)
  const output = JSON.parse(compiler.compile(JSON.stringify(input)))
  if (Object.keys(output.sources || {}).length == 0) {
    console.error(JSON.stringify(output, null, 2))
    console.error('\nCompilation failed')
    return
  }
  console.log('Compilation successful.')

  if (options.upload) {
    await upload({
      host: options.host,
      projectOwner,
      projectSlug,
      auth,
      metadata
    })
  }
  return
}

async function upload(args: {
  host: string
  projectOwner?: string
  projectSlug: string
  auth: Auth
  metadata: Metadata
}) {
  const { host, projectOwner, projectSlug, auth, metadata } = args
  const source = readSources(SRC_ROOT, SRC_ROOT)

  console.log('Uploading...')

  const req = {
    projectOwner,
    projectSlug,
    compileSpec: {
      multiFile: {
        source,
        compilerSettings: JSON.stringify(metadata.settings)
      },
      solidityVersion: metadata.solidityVersion,
      contractName: metadata.contractName,
      constructorArgs: metadata.constructorArgs
    }
  }

  const uploadURL = new URL('/api/v1/solidity/user_compilation', host)
  await fetch(uploadURL.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...auth
    },
    body: JSON.stringify(req)
  })
    .then((res) => res.json())
    .then((resp: any) => {
      const id = resp.userCompilationId
      if (id) {
        console.log(
          `Successfully uploaded, check it out at ${host}/${projectOwner}/${projectSlug}/contracts/compilation/${id}`
        )
      } else {
        console.error(resp)
        console.error('Failed to upload.')
      }
    })
    .catch((err) => {
      console.error('Failed to upload:', err)
    })
}

function prepareCompilerInput(metadata: Metadata, root: string) {
  const input: any = {
    language: 'Solidity',
    sources: {},
    settings: {
      ...metadata.settings,
      outputSelection: { '*': { '*': [] } }
    }
  }
  const files = readSources(root, root)
  for (const key in files) {
    input.sources[key] = { content: files[key] }
  }
  return input
}

function readSources(dir: string, root: string) {
  let ret: { [path: string]: string } = {}
  const childs = fs.readdirSync(dir)
  for (const child of childs) {
    const p = path.resolve(dir, child)
    if (fs.statSync(p).isDirectory()) {
      ret = { ...ret, ...readSources(p, root) }
    } else if (child.endsWith('.sol')) {
      ret[path.relative(root, p)] = fs.readFileSync(p, 'utf8')
    }
  }
  return ret
}
