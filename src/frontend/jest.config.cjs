/**
 * CommonJS Jest config (explicit .cjs so it loads correctly even though
 * package.json sets "type": "module" for Vite).
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Redirect the two import.meta.env touchpoints to a Jest-safe mock.
    // See src/tests/__mocks__/envConfig.ts for why this is necessary, and
    // why the module is named "envConfig" rather than the generic "config"
    // (a generic name previously collided with @testing-library/dom's own
    // internal ./config submodule via this same global regex).
    '^\\.\\./api/envConfig$': '<rootDir>/src/tests/__mocks__/envConfig.ts',
    '^\\./envConfig$': '<rootDir>/src/tests/__mocks__/envConfig.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          target: 'ES2020',
          types: ['jest', 'node'],
        },
      },
    ],
  },
  testMatch: ['<rootDir>/src/tests/**/*.test.ts', '<rootDir>/src/tests/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/tests/**', '!src/main.tsx', '!src/vite-env.d.ts'],
};
