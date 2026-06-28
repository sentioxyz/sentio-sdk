import { defineConfig } from 'tsdown'
import fs from 'node:fs'
import packageJson from '../package.json' with { type: 'json' }

// Map each published export to an object entry so the bundled output preserves the
// dist/<subpath>.js layout (array entries would collide on the many nested index.ts).
// Skip exports whose source is missing (e.g. phantom ./btc) — tsup tolerated these.
const entry = Object.fromEntries(
  Object.values(packageJson.exports)
    .filter((p) => !p.includes('codegen'))
    .map((p) => {
      const rel = p.replace(/^\.\/dist\//, '').replace(/\.js$/, '')
      return [rel, `./src/${rel}.ts`]
    })
    .filter(([, src]) => fs.existsSync(src))
)

export default defineConfig({
  // tsdown sets cwd to the config file's dir; pin to the actual working directory.
  cwd: process.cwd(),
  entry,
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  // Emit dist/*.js (not .mjs) per package "type" so exports resolve.
  fixedExtension: false,
  minify: process.env['BRANCH'] === 'release',
  sourcemap: true,
  clean: true,
  // dts handled separately via `tsc --emitDeclarationOnly --declaration` (bundle:dts);
  // disable the auto-dts tsdown would otherwise enable from tsconfig `declaration: true`.
  dts: false,
  deps: {
    alwaysBundle: [/.*/],
    neverBundle: [/^@sentio\/(chain|runtime).*$/, /^piscina.*$/, /^graphql$/],
    onlyBundle: false
  },
  outputOptions: {
    keepNames: true
  }
})
