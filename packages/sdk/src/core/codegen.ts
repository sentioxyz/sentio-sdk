import fs from 'fs'
import path from 'path'

export async function recursiveCodegen(
  abisDir: string,
  outDir: string,
  codegenInternal: (abisDir: string, outDir: string) => Promise<number>
) {
  if (!fs.existsSync(abisDir)) {
    return 0
  }

  let numFiles = await codegenInternal(abisDir, outDir)

  const items = await fs.readdirSync(abisDir, { recursive: true, withFileTypes: true })
  for (const item of items) {
    if (item.isDirectory()) {
      const relativePath = path.relative(abisDir, item.parentPath)
      numFiles += await codegenInternal(
        path.join(abisDir, relativePath, item.name),
        path.join(outDir, relativePath, item.name)
      )
    }
  }

  return numFiles
}
