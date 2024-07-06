import { defineConfig } from 'tsup'
import packageJson from '../package.json'

const entry = Object.values(packageJson.exports).map((p) => p.replace('lib', 'src').replace('.js', '.ts'))

export default defineConfig({
  esbuildOptions: (options) => {
    options.banner = {
      js: `import { createRequire as createRequireSdkShim } from 'module'; const require = createRequireSdkShim(import.meta.url);`
    }
  },
  entry,
  outDir: 'lib',
  clean: true,
  dts: true,
  format: 'esm',
  // keepNames: true,
  external: ['@project-serum/anchor', /^@sentio\/(ethers).*$/, 'graphql', 'typechain']
})
