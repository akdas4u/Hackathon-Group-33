// Jest-only stand-in for src/api/envConfig.ts. Jest (CommonJS) cannot parse
// the `import.meta.env` syntax used by the real file, so jest.config.cjs
// redirects every import of that module to this mock (see moduleNameMapper).
export const API_BASE_URL = 'http://localhost:5000';
export const APP_ENV = 'test';
export const MOCK_AUTH = true;
