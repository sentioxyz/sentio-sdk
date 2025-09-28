import fs, { readFileSync, writeFileSync } from 'fs'
import chalk from 'chalk'
import path from 'path'
import { mkdirpSync } from 'mkdirp'
import { events } from 'starknet'
import { StarknetChainId } from '@sentio/chain'
import { Abi } from '@sentio/abi-wan-kanabi'
import { recursiveCodegen } from '../../core/codegen.js'

export async function codegen(abisDir: string, outDir: string) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  const numFiles = await recursiveCodegen(abisDir, outDir, codegenInternal)
  console.log(chalk.green(`Generated ${numFiles} files for Starknet`))
}

async function codegenInternal(abisDir: string, outDir: string): Promise<number> {
  const allFiles = fs.readdirSync(abisDir, { recursive: true }) as string[]

  const abis: Record<string, any> = {}
  let fileCount = 0

  function guessNameFromAbi(abi: any, address: string) {
    if (Array.isArray(abi)) {
      const arr = abi as any[]
      for (const a of arr) {
        if (a.type == 'impl') {
          return a.name.replace('Impl', '')
        }
      }
    }
    return 'Contract' + address.replace('0x', '').slice(0, 6)
  }

  for (const f of allFiles) {
    if (f.toLowerCase().endsWith('.json')) {
      let name = f.replace('.json', '')
      const content = readFileSync(path.join(abisDir, f))
      const abi = JSON.parse(content.toString())
      let chain = StarknetChainId.STARKNET_MAINNET
      if (name.startsWith('sepolia/')) {
        chain = StarknetChainId.STARKNET_SEPOLIA
        name = name.slice('sepolia/'.length)
      }
      const parts = name.split('-')
      const address = parts.pop() as string
      if (parts.length > 0) {
        name = parts.join('')
      } else {
        name = guessNameFromAbi(abi, address)
      }
      abis[name] = {
        name,
        address,
        chain,
        abi
      }
    }
  }

  const tABIContents: string[] = []

  for (const [name, abi] of Object.entries(abis)) {
    tABIContents.push(`export const ABI_${name} = ${JSON.stringify(abi.abi, null, 2)} as const;`)
  }

  mkdirpSync(outDir)
  writeFileSync(path.join(outDir, 'tabi.ts'), tABIContents.join('\n'))
  fileCount++
  for (const { name, address, chain, abi: jsonAbi } of Object.values(abis)) {
    const content: string[] = []
    content.push(
      `import { StarknetProcessorConfig, StarknetEvent, AbstractStarknetProcessor, StarknetContext } from '@sentio/sdk/starknet'`
    )
    content.push(`import { EventToPrimitiveType, TypedContractView, Abi } from "@sentio/abi-wan-kanabi"`)
    content.push(`import { ABI_${name} } from "./tabi.js"\n`)
    content.push(`export type ${name} = TypedContractView<typeof ABI_${name}>`)
    const abi = jsonAbi as Abi
    const abiEventsEnums = abi.filter((obj) => obj.type == 'event' && obj.kind === 'enum')
    const eventMap: Record<string, string> = {}
    for (const ev of Object.values(events.getAbiEvents(abi))) {
      const fullName = ev.name as string
      let eventName = fullName
      for (const e of abiEventsEnums) {
        for (const v of e.variants) {
          if (v.type === fullName) {
            eventName = v.name
            break
          }
        }
      }

      eventMap[eventName] = fullName
      content.push(`export type ${eventName} = EventToPrimitiveType<typeof ABI_${name}, "${fullName}">`)
    }

    content.push(`\nexport class ${name}Processor extends AbstractStarknetProcessor {
  constructor(abi: Abi, config: Partial<StarknetProcessorConfig>) {
    super(abi, {
      name: "${name}",
      address: "${address}",
      chainId: "${chain}",
      abi,
      ...config
    })
  }`)
    content.push(`\tstatic bind(config: Partial<StarknetProcessorConfig>) {
      return new ${name}Processor(ABI_${name}, config)
  }`)

    for (const [eventName, structName] of Object.entries(eventMap)) {
      content.push(`\ton${eventName}(handler: (event: StarknetEvent<${eventName}>, ctx: StarknetContext<${name}>) => Promise<void>) {
    return this.onEvent<${eventName}, ${name}>("${eventName}", "${structName}", handler)
  }`)
    }

    content.push(`}`)
    writeFileSync(path.join(outDir, `${name}-processor.ts`), content.join('\n'))
    fileCount++
  }

  return fileCount
}
