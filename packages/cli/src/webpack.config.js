/* eslint-disable */
const path = require('path')

module.exports = {
  entry: {
    lib: './src/processor.ts',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  target: 'node',
  mode: 'production',
  externals: [
    {
      protobufjs: 'commonjs2 protobufjs',
      aptos: 'commonjs2 aptos-sdk',
      ethers: 'commonjs2 ethers',
      bs58: 'commonjs2 bs58',
      "bignumber.js": 'commonjs2 bignumber.js',
      'bn.js': 'commonjs2 bn.js',
      'csv-parse': 'commonjs2 csv-parse',
    },
    function ({ context, request }, callback) {
      if (/^@(ethersproject|solana|project-serum|nice-grpc).*$/.test(request)) {
        return callback(null, 'commonjs ' + request)
      }
      if (/^nice-grpc.*$/.test(request)) {
        return callback(null, 'commonjs ' + request)
      }
      if (/^@sentio\/(sdk|runtime|base|protos).*$/.test(request)) {
        return callback(null, 'commonjs ' + request)
      }
      callback()
    },
  ],
}
