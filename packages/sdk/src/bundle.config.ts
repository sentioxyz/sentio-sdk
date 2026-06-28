import { defineConfig } from 'tsdown'
import packageJson from '../package.json' with { type: 'json' }

// Bundle exactly the published entry points. tsdown preserves the nested src/
// structure via the common-ancestor root, so output matches the dist/<subpath>.js
// export layout.
const entry = Object.values(packageJson.exports)
  .filter((p) => !p.includes('codegen'))
  .map((p) => p.replace(/^\.\/dist\//, 'src/').replace(/\.js$/, '.ts'))

export default defineConfig({
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
  // disable the auto-dts tsdown would enable from tsconfig `declaration: true`.
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
