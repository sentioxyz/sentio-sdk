import { defineConfig } from 'tsup'
import packageJson from '../package.json'
import { external } from './tsup.config.js'

const entry = Object.values(packageJson.exports)
  .filter((x) => !x.includes('codegen'))
  .map((p) => p.replace('lib', 'src').replace('.js', '.ts'))

export default defineConfig({
  esbuildOptions: (options) => {
    options.banner = {
      js: `import { createRequire as createRequireSdkShim } from 'module'; const require = createRequireSdkShim(import.meta.url);`
    }
  },
  entry,
  outDir: 'lib',
  minify: process.env['BRANCH'] === 'release',
  sourcemap: true,
  clean: true,
  // https://github.com/egoist/tsup/issues/920, use `tsc --emitDeclarationOnly --declaration` as a workaround
  // dts: true,
  format: 'esm',
  keepNames: true,
  external: [...external, /^@sentio\/(chain|runtime).*$/, /^piscina.*$/, /^graphql$/]
})
