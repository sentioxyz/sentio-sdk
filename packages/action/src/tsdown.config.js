// NOTE: This config is intentionally plain JavaScript (not TypeScript). It is
// copied verbatim to @sentio/action/dist and loaded by `sentio build` from the
// user's node_modules, where Node refuses to strip types from .ts files. A .js
// config has no types to strip and loads natively everywhere. Keep it .js — do
// not rename to .ts. See packages/sdk/src/tsdown.config.js for the full rationale.
import { defineConfig } from 'tsdown'

// Force-keep every source module so tree-shaking never drops a self-registering
// handler (see packages/sdk/src/tsdown.config.js for rationale).
function sentioRegistrationGuard() {
  return {
    name: 'sentio-registration-guard',
    transform: {
      filter: { id: /\/src\/(.+\/)*.+\.ts$/ },
      // Set the flag only (no code change) so the module is force-kept without
      // counting as a transform (avoids a spurious broken-sourcemap warning).
      handler() {
        return { moduleSideEffects: 'no-treeshake' }
      }
    }
  }
}

export default defineConfig({
  // Shipped to @sentio/action/dist and run against the user's project; pin cwd
  // to the actual working directory (matches tsup's path resolution).
  cwd: process.cwd(),
  entry: {
    lib: 'src/processor.ts'
  },
  format: 'esm',
  platform: 'node',
  // Emit lib.js (not lib.mjs) per package "type".
  fixedExtension: false,
  minify: true,
  sourcemap: 'inline',
  clean: true,
  // A processor bundle needs no declarations.
  dts: false,
  plugins: [sentioRegistrationGuard()],
  deps: {
    alwaysBundle: [/.*/],
    neverBundle: [/^@sentio\/(sdk|runtime|ethers).*$/],
    onlyBundle: false
  },
  outputOptions: {
    codeSplitting: false,
    keepNames: true
  }
})
