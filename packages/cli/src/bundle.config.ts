import { defineConfig } from 'tsdown'

// Bundles the CLI itself into a single dist/index.js (loaded via bin.mjs).
// Everything is inlined except @sentio/sdk, which is resolved from the user's
// node_modules at runtime (the CLI calls into the user's installed SDK).
export default defineConfig({
  cwd: process.cwd(),
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  // Emit dist/index.js (not .mjs) per package "type".
  fixedExtension: false,
  sourcemap: true,
  clean: true,
  // The CLI is run, not consumed as a library.
  dts: false,
  // Inject __dirname/__filename for ESM; require() is auto-shimmed via createRequire.
  // Replaces the esbuild `--inject:src/cjs-shim.ts` global shim (rolldown provides
  // require/__dirname to bundled CommonJS deps through its own interop).
  shims: true,
  deps: {
    alwaysBundle: [/.*/],
    neverBundle: [/^@sentio\/sdk/],
    onlyBundle: false
  },
  outputOptions: {
    // Keep it a single file like the previous esbuild bundle.
    codeSplitting: false
  }
})
