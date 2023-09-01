import { defineConfig } from 'tsup'

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
  external: [
    'protobufjs',
    'aptos',
    'aptos-sdk',
    'ethers',
    'bs58',
    'bn.js',
    'csv-parse',
    'node-fetch',
    /^nice-grpc.*$/,
    /^prettier.*$/,
    /^@(ethersproject|solana|project-serum).*$/,
    /^@sentio\/(sdk|runtime|protos|bigdecimal|ethers).*$/,
    /^@typemove\/.*$/,
    /^@mysten\/(bcs|sui.js).*$/
  ]
})
