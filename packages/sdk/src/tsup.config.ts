import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    lib: 'src/processor.ts',
  },
  minify: true,
  sourcemap: 'inline',
  clean: true,
  format: 'esm',
  external: [
    'protobufjs',
    'aptos',
    'ethers',
    'bs58',
    'bn.js',
    'csv-parse',
    /^nice-grpc.*$/,
    /^@(ethersproject|solana|project-serum).*$/,
    /^@sentio\/(sdk|runtime|protos|bigdecimal|ethers).*$/,
  ],
})
