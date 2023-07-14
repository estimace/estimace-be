import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^app/(.*)$': '<rootDir>/src/$1',
    '@/(.*)': '<rootDir>/$1',
  },
  globalSetup: './tests/setup.ts',
}

export default jestConfig
