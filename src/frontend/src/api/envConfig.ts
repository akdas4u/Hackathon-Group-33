/**
 * Single point of contact with `import.meta.env`.
 *
 * Jest runs under CommonJS and cannot parse `import.meta` syntax, so every
 * other module (and every test) should import these constants instead of
 * touching `import.meta.env` directly. This file is the only one that needs
 * a Jest-side mock (see src/tests/__mocks__/envConfig.ts).
 *
 * NOTE ON THE NAME: deliberately NOT called "config.ts" — Jest's
 * moduleNameMapper matches on the literal import specifier string, not the
 * resolved path, so a generic "./config" mapping would also hijack any
 * third-party package's own "./config" submodule (this bit us once with
 * @testing-library/dom, which has its own internal ./config.js). Keeping
 * this filename distinctive avoids that collision.
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
export const APP_ENV: string = import.meta.env.VITE_APP_ENV;
export const MOCK_AUTH: boolean = import.meta.env.VITE_MOCK_AUTH === 'true';
