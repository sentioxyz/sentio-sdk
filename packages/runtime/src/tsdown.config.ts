import { defineConfig } from 'tsdown'

export default defineConfig({
  // tsdown sets cwd to the config file's directory; restore tsup's behavior of
  // resolving entries/paths relative to the actual working directory.
  cwd: process.cwd(),
  entry: ['src/index.ts', 'src/processor-runner.ts', 'src/test-processor.test.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  // tsdown defaults to fixed .mjs/.cjs on node; use package "type" to emit .js/.d.ts
  // like tsup did (exports/bin reference ./dist/*.js).
  fixedExtension: false,
  minify: process.env['BRANCH'] === 'release',
  sourcemap: true,
  clean: true,
  dts: true,
  // Bundle deps into the published artifact (the publish workflow drops them from
  // package.json); keep piscina external so its worker entry resolves at runtime.
  deps: {
    alwaysBundle: [/.*/],
    neverBundle: [/^piscina.*$/],
    onlyBundle: false,
    // The JS bundles all deps, but the .d.ts must NOT inline node_modules types:
    // clear alwaysBundle for declarations so @sentio/protos, rxjs, etc. stay as
    // imports (identity-compatible for consumers) while own types are still bundled.
    dts: { alwaysBundle: [] }
  }
})
