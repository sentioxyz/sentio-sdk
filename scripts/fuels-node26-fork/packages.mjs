// Shared definitions for the fuels Node 26 fork: which packages, and how names map.
export const UPSTREAM_VERSION = '0.103.0'
// Version our packages are published under. Defaults to the upstream version (the
// names are new, so the version is free). Override with FORK_VERSION to re-release.
export const FORK_VERSION = process.env.FORK_VERSION || UPSTREAM_VERSION
export const EXTRA_NODE_RANGE = '^26.0.0'
export const EXPECTED_NODE_RANGE = '^20.0.0 || ^22.0.0 || ^24.0.0'

const SUBPACKAGES = [
  'abi-coder', 'abi-typegen', 'account', 'address', 'contract', 'crypto', 'errors', 'hasher',
  'math', 'merkle', 'program', 'recipes', 'script', 'transactions', 'utils', 'versions'
]

export const UPSTREAM_NAMES = ['fuels', ...SUBPACKAGES.map((s) => `@fuel-ts/${s}`)]

export function forkName(upstream) {
  if (upstream === 'fuels') return '@sentio/fuels'
  if (upstream.startsWith('@fuel-ts/')) return `@sentio/fuel-ts-${upstream.slice('@fuel-ts/'.length)}`
  throw new Error(`not a forked package: ${upstream}`)
}

// Directory-safe id, e.g. fuels, fuel-ts-abi-coder
export function slug(upstream) {
  return upstream === 'fuels' ? 'fuels' : `fuel-ts-${upstream.slice('@fuel-ts/'.length)}`
}

// File name `npm pack` gives a package, e.g. sentio-fuel-ts-abi-coder-0.103.0.tgz
export function tarballName(name, version) {
  return `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`
}

export const DEP_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies']
