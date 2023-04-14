/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  modulePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/templates/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@sentio/cli(.*)$': '<rootDir>/src/$1',
  },
}
