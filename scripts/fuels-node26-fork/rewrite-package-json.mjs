// Usage: node rewrite-package-json.mjs <path/to/package.json>
// Rewrites exactly three things: name, engines.node, and internal fuels/@fuel-ts deps
// (to npm: aliases of the forked names). Aborts on anything unexpected.
import { readFileSync, writeFileSync } from 'node:fs'
import {
  DEP_FIELDS, EXPECTED_NODE_RANGE, EXTRA_NODE_RANGE, FORK_VERSION, UPSTREAM_NAMES, UPSTREAM_VERSION, forkName
} from './packages.mjs'

const file = process.argv[2]
const raw = readFileSync(file, 'utf8')
const pkg = JSON.parse(raw)

if (!UPSTREAM_NAMES.includes(pkg.name)) throw new Error(`unexpected package name ${pkg.name}`)
if (pkg.version !== UPSTREAM_VERSION) throw new Error(`${pkg.name}: unexpected version ${pkg.version}`)
if (pkg.engines?.node !== EXPECTED_NODE_RANGE) {
  throw new Error(`${pkg.name}: unexpected engines.node ${JSON.stringify(pkg.engines?.node)}`)
}

const upstreamName = pkg.name
pkg.name = forkName(upstreamName)
if (FORK_VERSION !== UPSTREAM_VERSION) pkg.version = FORK_VERSION
pkg.engines.node = `${EXPECTED_NODE_RANGE} || ${EXTRA_NODE_RANGE}`

for (const field of DEP_FIELDS) {
  for (const [dep, range] of Object.entries(pkg[field] ?? {})) {
    if (!UPSTREAM_NAMES.includes(dep)) continue
    if (range !== UPSTREAM_VERSION) throw new Error(`${upstreamName}: ${field}.${dep} is ${range}, expected exact ${UPSTREAM_VERSION}`)
    pkg[field][dep] = `npm:${forkName(dep)}@${FORK_VERSION}`
  }
}

const indent = raw.match(/^\{\r?\n([ \t]+)"/)?.[1] ?? 2
writeFileSync(file, JSON.stringify(pkg, null, indent) + (raw.endsWith('\n') ? '\n' : ''))
console.log(`${upstreamName} -> ${pkg.name}@${pkg.version}`)
