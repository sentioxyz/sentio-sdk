import { defineConfig } from 'tsup'

export const external = ['@project-serum/anchor', 'graphql']

export default defineConfig({
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
  external: [...external, /^@sentio\/(sdk|runtime|ethers).*$/]
})
