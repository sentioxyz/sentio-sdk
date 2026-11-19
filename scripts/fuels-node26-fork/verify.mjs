// Usage: node verify.mjs [dir-with-fork-tarballs]   (default: work/dist/)
//
// For each of the 17 packages, extracts the official tarball and the fork tarball into
// fresh directories and checks:
//   - same file list, no symlinks, same executable bits
//   - every file except package/package.json is byte-identical (sha256)
//   - package.json differs only in name, engines.node, internal deps (and version if FORK_VERSION is set)
//   - the new engines.node accepts Node 26.13.0 and still accepts 20/22/24
// Prints the package.json diff of every package and writes MANIFEST.txt with tarball hashes.
// After publishing, `npm pack` the published packages into a directory and pass it here
// to prove the registry copies are the verified ones.
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEP_FIELDS, FORK_VERSION, UPSTREAM_NAMES, UPSTREAM_VERSION, forkName, slug, tarballName
} from './packages.mjs'

const ROOT = resolve(process.env.WORK_DIR ?? join(dirname(fileURLToPath(import.meta.url)), 'work'))
const distDir = resolve(process.argv[2] ?? join(ROOT, 'dist'))
const workDir = join(ROOT, 'verify')
const TAR_ENV = { ...process.env, COPYFILE_DISABLE: '1' }

// semver bundled with npm (trusted, not from the downloaded packages)
const npmRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
const semver = createRequire(join(npmRoot, 'npm', 'package.json'))('semver')

const sha = (algo, file, enc = 'hex') => createHash(algo).update(readFileSync(file)).digest(enc)

function walk(dir, base = dir, out = new Map()) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name)
    const st = lstatSync(full)
    const rel = full.slice(base.length + 1)
    if (st.isSymbolicLink()) throw new Error(`symlink in tarball: ${rel}`)
    if (st.isDirectory()) walk(full, base, out)
    else out.set(rel, { exec: (st.mode & 0o111) !== 0, hash: sha('sha256', full) })
  }
  return out
}

function extract(tgz, dest) {
  const entries = execFileSync('tar', ['-tzf', tgz], { encoding: 'utf8' }).split('\n').filter(Boolean)
  const bad = entries.filter((e) => !e.startsWith('package/') || e.split('/').includes('..'))
  if (bad.length) throw new Error(`unsafe paths in ${tgz}: ${bad.slice(0, 3)}`)
  mkdirSync(dest, { recursive: true })
  execFileSync('tar', ['-xzf', tgz, '-C', dest], { env: TAR_ENV })
  return walk(dest)
}

// Leaf paths whose values differ between two JSON values.
function changedPaths(a, b, path = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return []
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
  if (!isObj(a) || !isObj(b)) return [path]
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) =>
    changedPaths(a[k], b[k], path ? `${path}.${k}` : k)
  )
}

rmSync(workDir, { recursive: true, force: true })
const manifest = []
const failures = []

for (const upstream of UPSTREAM_NAMES) {
  const s = slug(upstream)
  const errs = []
  const officialDir = join(ROOT, 'official', s)
  const officialTgz = join(officialDir, readdirSync(officialDir).find((f) => f.endsWith('.tgz')))
  const forkTgz = join(distDir, tarballName(forkName(upstream), FORK_VERSION))

  const a = extract(officialTgz, join(workDir, s, 'official'))
  const b = extract(forkTgz, join(workDir, s, 'fork'))

  for (const f of a.keys()) if (!b.has(f)) errs.push(`missing in fork: ${f}`)
  for (const f of b.keys()) if (!a.has(f)) errs.push(`extra in fork: ${f}`)
  let identical = 0
  for (const [f, av] of a) {
    const bv = b.get(f)
    if (!bv) continue
    if (av.exec !== bv.exec) errs.push(`exec bit differs: ${f}`)
    if (f === 'package/package.json') continue
    if (av.hash === bv.hash) identical++
    else errs.push(`content differs: ${f}`)
  }

  const pa = join(workDir, s, 'official', 'package', 'package.json')
  const pb = join(workDir, s, 'fork', 'package', 'package.json')
  const ja = JSON.parse(readFileSync(pa, 'utf8'))
  const jb = JSON.parse(readFileSync(pb, 'utf8'))
  const allowed = new Set(['name', 'engines.node'])
  if (FORK_VERSION !== UPSTREAM_VERSION) allowed.add('version')
  for (const field of DEP_FIELDS) {
    for (const dep of Object.keys(ja[field] ?? {})) {
      if (!UPSTREAM_NAMES.includes(dep)) continue
      allowed.add(`${field}.${dep}`)
      const want = `npm:${forkName(dep)}@${FORK_VERSION}`
      if (jb[field]?.[dep] !== want) errs.push(`${field}.${dep} is ${jb[field]?.[dep]}, want ${want}`)
    }
  }
  const changed = changedPaths(ja, jb)
  for (const p of changed) if (!allowed.has(p)) errs.push(`unexpected package.json change: ${p}`)
  if (JSON.stringify(Object.keys(ja)) !== JSON.stringify(Object.keys(jb))) errs.push('package.json key order changed')
  if (jb.name !== forkName(upstream)) errs.push(`name is ${jb.name}`)
  for (const v of ['20.18.0', '22.11.0', '24.13.0', '26.13.0']) {
    if (!semver.satisfies(v, jb.engines.node)) errs.push(`engines.node ${jb.engines.node} rejects ${v}`)
  }

  console.log(`\n=== ${upstream} -> ${jb.name}@${jb.version}: ${a.size} files, ${identical} identical besides package.json`)
  const d = spawnSync('diff', ['-u', '--label', `${upstream}/package.json`, '--label', `${jb.name}/package.json`, pa, pb], {
    encoding: 'utf8'
  })
  console.log(d.stdout.trimEnd())
  if (errs.length) {
    failures.push(...errs.map((e) => `${upstream}: ${e}`))
    console.log(errs.map((e) => `  FAIL ${e}`).join('\n'))
  }
  manifest.push(
    `${jb.name}@${jb.version}\n  fork     sha512-${sha('sha512', forkTgz, 'base64')}\n` +
      `  official ${upstream}@${ja.version} sha512-${sha('sha512', officialTgz, 'base64')}`
  )
}

writeFileSync(join(ROOT, 'MANIFEST.txt'), manifest.join('\n') + '\n')
if (failures.length) {
  console.error(`\nFAILED (${failures.length}):\n${failures.join('\n')}`)
  process.exit(1)
}
console.log(`\nOK: ${UPSTREAM_NAMES.length} packages verified against official tarballs (${distDir})`)
