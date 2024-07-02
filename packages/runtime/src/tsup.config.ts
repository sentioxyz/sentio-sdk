import { defineConfig } from 'tsup'

export default defineConfig({
  esbuildOptions: (options) => {
    options.banner = {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    }
  },
  entry: ['src/index.ts', 'src/processor-runner.ts'],
  outDir: 'lib',
  clean: true,
  dts: true,
  format: 'esm'
})
