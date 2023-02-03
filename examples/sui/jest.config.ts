/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}
