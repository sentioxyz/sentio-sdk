import { defineConfig } from 'tsup'

export default defineConfig({
  esbuildOptions: (options) => {
    options.banner = {
      js: `import { createRequire as createRequireShim } from 'module'; const require = createRequireShim(import.meta.url);`
    }
  },
  entry: ['src/index.ts', 'src/processor-runner.ts'],
  outDir: 'lib',
  minify: process.env['BRANCH'] === 'release',
  sourcemap: true,
  clean: true,
  dts: true,
  format: 'esm'
})
