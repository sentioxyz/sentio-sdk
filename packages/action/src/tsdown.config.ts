import { defineConfig } from 'tsdown'

// Force-keep every source module so tree-shaking never drops a self-registering
// handler (see packages/sdk/src/tsdown.config.ts for rationale).
function sentioRegistrationGuard() {
  return {
    name: 'sentio-registration-guard',
    transform: {
      filter: { id: /\/src\/(.+\/)*.+\.ts$/ },
      // Set the flag only (no code change) so the module is force-kept without
      // counting as a transform (avoids a spurious broken-sourcemap warning).
      handler() {
        return { moduleSideEffects: 'no-treeshake' as const }
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
