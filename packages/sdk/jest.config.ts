/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@sentio/sdk(.*)$': '<rootDir>/src/$1',
  },
}
