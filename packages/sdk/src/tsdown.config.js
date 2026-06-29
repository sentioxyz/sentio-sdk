// NOTE: This config is intentionally plain JavaScript (not TypeScript). It is
// copied verbatim to @sentio/sdk/dist and loaded by `sentio build` from the
// user's node_modules. Node refuses to strip types from .ts files under
// node_modules ("Stripping types is currently unsupported for files under
// node_modules"), so a .ts config fails to load there. A .js config has no types
// to strip and loads natively on every Node version and package manager. Keep it
// .js — do not rename to .ts.
import { defineConfig } from 'tsdown'

let env
try {
  const dotenv = await import('dotenv')
  env = dotenv.config().parsed
} catch (e) {}

// Force-keep every source module so tree-shaking never drops a self-registering
// processor handler (handlers register at import time; their exports are unused).
// Replaces the @sentio/tsup fork's baked-in `sentio-processor` esbuild plugin.
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
  // tsdown sets cwd to the config file's dir; this config is shipped to
  // @sentio/sdk/dist and run against the user's project, so pin cwd to the
  // actual working directory (matches tsup's entry/path resolution).
  cwd: process.cwd(),
  entry: {
    lib: 'src/processor.ts'
  },
  format: 'esm',
  platform: 'node',
  // Emit lib.js (not lib.mjs) per package "type"; the CLI asserts a single dist/lib.js.
  fixedExtension: false,
  minify: true,
  sourcemap: 'inline',
  clean: true,
  // A processor bundle needs no declarations; tsdown would otherwise auto-enable
  // dts from the tsconfig's `declaration: true`.
  dts: false,
  env,
  plugins: [sentioRegistrationGuard()],
  // Bundle the user's dependencies into a single self-contained file, keeping
  // only the SDK runtime + a few heavy deps external. tsdown externalizes
  // package.json deps by default, so this restores the fork's "include deps" behavior.
  deps: {
    alwaysBundle: [/.*/],
    neverBundle: [/^@sentio\/(sdk|runtime|action).*$/, /^piscina.*$/, /^graphql$/],
    onlyBundle: false
  },
  outputOptions: {
    // tsdown ignores tsup `splitting:false`; disable code splitting so the single
    // entry emits exactly one lib.js (the CLI asserts on this).
    codeSplitting: false,
    // Preserve class/function names — `this.constructor.name` is read at runtime.
    keepNames: true
  }
})
