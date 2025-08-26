import { defineConfig } from 'tsup'
let env
try {
  const dotenv = await import('dotenv')
  env = dotenv.config().parsed
} catch (e) {}

export const external = []

export default defineConfig({
  // https://github.com/egoist/tsup/issues/1030#issuecomment-1953502800
  env,
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
  keepNames: true,
  // dts: {
  //   resolve: true,
  // },
  publicDir: '../abis',
  splitting: false,
  external: [...external, /^@sentio\/(sdk|runtime|action).*$/, /^piscina.*$/, /^graphql$/]
})
