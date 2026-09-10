# STACK.md

> Technical stack specification and implementation contract for Medication Inventory.

**Status:** Active
**Version:** 1.0
**Last updated:** 2026-09-10
**Project type:** Client-side web application

## 0. Contract

This document records the technology choices, dependencies, boundaries, security model, and delivery assumptions. Keep it synchronized with source, manifests, CI, and hosting configuration. Prefer the smallest stack that preserves the product behavior.

## 1. Context and requirements

The project must provide a responsive inventory dashboard with deterministic medication status rules, search, stock movements, local persistence, accessible forms/dialogs, static deployment, and reproducible quality checks. It does not require a server, database, authentication, AI, payments, or private runtime secrets.

## 2. Stack summary

| Area        | Technology                                                                    | Purpose                                                 |
| ----------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Language    | TypeScript `5.9.3`                                                            | Strict application source (`tsc -b` project references) |
| Frontend    | React `19.2.8` / React DOM `19.2.8`                                           | UI and local state                                      |
| Build       | Vite `7.2.4`                                                                  | Dev server and static bundle                            |
| Styling     | Tailwind CSS `4.3.3` + `@tailwindcss/vite` `4.3.3`                            | Utility and token-driven UI                             |
| Icons       | lucide-react `1.39.0`                                                         | Consistent interface icons                              |
| Utilities   | clsx (`^2.1.1`), tailwind-merge (`^3.4.0`)                                    | Class composition                                       |
| Testing     | Vitest `4.1.0`, Testing Library React `16.3.3` / DOM `10.4.1`, jsdom `28.1.0` | Domain behavior and UI component tests                  |
| E2E Testing | Playwright & `@playwright/test` `1.63.0`                                      | End-to-end browser automation (Chromium)                |
| Quality     | ESLint `10.10.0` / `@eslint/js` `10.0.1`, Prettier `3.9.6`                    | Static checks and formatting                            |
| Hosting     | Cloudflare static assets via `wrangler.jsonc`                                 | Production delivery                                     |
| CI/CD       | GitHub Actions (Node.js 22.x)                                                 | Automated verification pipeline                         |

## 3. Runtime and packages

GitHub Actions pins Node.js 22.x as the CI runtime. The npm manifest and lockfile do not currently declare or enforce a project-level Node.js engine. npm and the committed `package-lock.json` are the only package workflow; do not hand-edit the lockfile or introduce a second toolchain.

## 4. Frontend architecture

The app is a Vite SPA rendered entirely in the browser. State is local React state, persistence is a small `useInventory` hook, and deterministic rules live in `src/lib/medications.ts`, `inventory.ts`, `metrics.ts`, and `storage.ts`. UI is divided into reusable `ui` components and domain components. There is no router because the product is a single screen.

## 5. Data, security, and boundaries

Browser `localStorage` is the only persistence boundary. Stored JSON is untrusted and is parsed/validated before entering React state. No authentication or authorization is claimed; records are local to the browser and are not a server backup. No environment variables or secrets are required. The client contains no privileged credentials or external service integration.

## 6. Hosting and delivery

`vite build` emits `dist`; `wrangler.jsonc` points static asset delivery at that directory. The known public demo is `https://inventory.leonemarcos.com/`. Production crawler files are emitted from `public/`: `robots.txt`, `sitemap.xml`, `llms.txt`, and `_headers`. The repository does not deploy from CI in this checkout; deployment ownership remains the configured Cloudflare project.

## 7. Testing and quality

Required local gates are `npm run format:check`, `npm run lint`, `npm run typecheck` (`tsc -b`), `npm test`, `npm run build`, and `npm run test:e2e`. The build includes TypeScript project compilation via `tsc -b`. Vitest includes both `tests/**/*.test.{ts,tsx}` and `src/**/*.test.{ts,tsx}`, so the component and domain suites run under `npm test`; those tests cover status precedence, overlapping categories, stock rules, search, metrics, component rendering, and malformed local-storage records. The current automated Playwright E2E test in Chromium verifies application loading, main title visibility, and opening and closing the medication creation dialog flow.

## 8. CI/CD

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`, uses Node.js 22.x, runs `npm ci`, production dependency audit (`npm audit --omit=dev --audit-level=high`), `npm run format:check`, `npm run lint`, `npm run typecheck` (`tsc -b`), `npm test`, `npm run build`, Playwright Chromium installation (`npx playwright install --with-deps chromium`), and `npm run test:e2e`. It does not force-push or deploy.

## 9. Performance

The app ships self-hosted Inter/Manrope WOFF2 fonts, a small WebP mark, and no remote runtime data requests. Keep the initial bundle simple, preserve stable layout dimensions, respect reduced motion, and measure before adding memoization, code splitting, or services.

## 10. Dependency and architectural policy

Reuse the current React/Vite/Tailwind stack before adding dependencies. Do not add a backend, database, auth provider, state-management library, CSS framework, ORM, analytics service, or client-side secret. Keep business rules out of presentation components and keep storage parsing at the trust boundary.

## 11. Technical decisions

| Date       | Decision                                                    | Alternatives            | Reason                                                              | Impact                                               |
| ---------- | ----------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| 2026-09-04 | Keep local browser persistence instead of adding a backend. | API, database, Supabase | No multi-user or server requirement exists for this portfolio demo. | Smaller deployment and explicit local-data boundary. |
| 2026-09-04 | Validate stored records before rendering.                   | Trust parsed JSON       | Browser storage can be stale, manually edited, or corrupt.          | Prevents malformed data from crashing the dashboard. |

## 12. Stack conformance audit

**Audit date:** 2026-09-10
**Overall status:** PASS WITH WARNINGS

| Area     | Specification                                        | Implementation                                                                                                                                              | Severity | Action                                             |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| Runtime  | npm lockfile and Node 22 CI                          | GitHub Actions pins Node.js 22.x and installs from the lockfile with `npm ci`; the manifest and lockfile do not enforce a project-level Node.js engine       | Info     | Keep the CI runtime explicit; add an engine only if project-level enforcement becomes necessary |
| Security | No secrets and validated storage boundary            | No env vars or privileged service; production dependency audit (`npm audit --omit=dev --audit-level=high`) enforced in CI; stored records validated on load | Info     | Continue automated security audits in CI           |
| Testing  | Unit, component, typecheck, lint, and Playwright E2E | `npm test` includes `tests/**/*.test.{ts,tsx}` and `src/**/*.test.{ts,tsx}` for component and domain coverage; CI also runs ESLint 10, Prettier, `tsc -b`, build, and the focused Playwright Chromium flow | Info     | Maintain Playwright coverage alongside unit tests  |
| Delivery | Static output and crawler files                      | `dist` contains Vite output and public metadata files after build; provider-side delivery responses are not verified by the repository pipeline            | Low      | Verify provider responses after published releases |

### Conclusion

The local/client stack and automated quality pipeline conform to the documented React 19 / Vite 7 / Tailwind CSS 4 baseline, including focused Playwright Chromium E2E testing, TypeScript project references (`tsc -b`), strict local-storage sanitization, and the Node.js 22.x CI workflow. External provider-side delivery verification remains a separate low-severity warning.
