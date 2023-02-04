import { defineConfig } from 'tsup'

export default defineConfig({
  esbuildOptions: (options) => {
    options.banner = {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
    }
  },
  entry: {
    lib: 'src/processor.ts',
  },
  minify: true,
  sourcemap: 'inline',
  clean: true,
  format: 'esm',
  dts: {
    resolve: true,
  },
  external: [
    'protobufjs',
    'aptos',
    'aptos-sdk',
    'ethers',
    'bs58',
    'bn.js',
    'csv-parse',
    /^nice-grpc.*$/,
    /^@(ethersproject|solana|project-serum).*$/,
    /^@sentio\/(sdk|runtime|protos|bigdecimal|ethers).*$/,
  ],
})
