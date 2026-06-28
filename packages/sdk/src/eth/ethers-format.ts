//
// Vendored from ethers v6.17.0 `src.ts/providers/format.ts`.
//
// `allowNull` and `arrayOf` are tiny internal combinators ethers uses to build its
// response formatters. They are NOT part of ethers' public API — the retired
// `@sentio/ethers` fork exposed them via an extra `export * from "./format.js"` in
// `providers/index.ts`, and the SDK's lazy formatter classes (`FormattedLog`,
// `FormattedTransactionResponse`, ...) import them from `ethers/providers`. Upstream
// keeps them private, so we vendor just these two here.
//
export type FormatFunc = (value: any) => any

export function allowNull(format: FormatFunc, nullValue?: any): FormatFunc {
  return function (value: any) {
    if (value == null) {
      return nullValue
    }
    return format(value)
  }
}

export function arrayOf(format: FormatFunc, allowNull?: boolean): FormatFunc {
  return (array: any) => {
    if (allowNull && array == null) {
      return null
    }
    if (!Array.isArray(array)) {
      throw new Error('not an array')
    }
    return array.map((i) => format(i))
  }
}
