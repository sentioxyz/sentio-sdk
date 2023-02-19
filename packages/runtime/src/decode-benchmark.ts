#!/usr/bin/env node

import fs from 'fs'

const fileContent = fs.readFileSync('../../../chain/aptos/testdata/block-0-9999.json', { encoding: 'utf-8' })
// console.log(fileContent)

const contents: object[] = JSON.parse(fileContent)

console.log(contents.length)

const raws: Uint8Array[] = []
for (const content of contents) {
  raws.push(new TextEncoder().encode(JSON.stringify(content)))
}

console.log('test begin')

const start = Date.now()

for (let i = 0; i < 10; i++) {
  for (const raw of raws) {
    const x = JSON.parse(new TextDecoder().decode(raw))
  }
}

const end = Date.now()
console.log((end - start) / 1000.0, 'seconds')
