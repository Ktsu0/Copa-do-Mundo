/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  rootDir: '.',
  roots: ['<rootDir>/test'],
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/shareds/presentation/components/$1',
    '^@/constants/(.*)$': '<rootDir>/src/shareds/presentation/constants/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/shareds/presentation/hooks/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
