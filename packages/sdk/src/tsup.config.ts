import { defineConfig } from 'tsup'
import dotenv from 'dotenv'

export const external = []

export default defineConfig({
  // https://github.com/egoist/tsup/issues/1030#issuecomment-1953502800
  env: dotenv.config().parsed,
  esbuildOptions: (options) => {
    options.banner = {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    }
  },
  entry: {
    lib: 'src/processor.ts'
  },
  minify: true,
  sourcemap: 'inline',
  clean: true,
  format: 'esm',
  // dts: {
  //   resolve: true,
  // },
  publicDir: '../abis',
  splitting: false,
  external: [...external, /^@sentio\/(sdk|runtime|action).*$/]
})
