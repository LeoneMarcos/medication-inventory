# STACK.md

> Technical stack specification and implementation contract for Medication Inventory.

**Status:** Active
**Version:** 1.0
**Last updated:** 2026-09-04
**Project type:** Client-side web application

## 0. Contract

This document records the technology choices, dependencies, boundaries, security model, and delivery assumptions. Keep it synchronized with source, manifests, CI, and hosting configuration. Prefer the smallest stack that preserves the product behavior.

## 1. Context and requirements

The project must provide a responsive inventory dashboard with deterministic medication status rules, search, stock movements, local persistence, accessible forms/dialogs, static deployment, and reproducible quality checks. It does not require a server, database, authentication, AI, payments, or private runtime secrets.

## 2. Stack summary

| Area | Technology | Purpose |
| --- | --- | --- |
| Language | TypeScript `~5.9.3` | Strict application source |
| Frontend | React `^19.2.0` / React DOM | UI and local state |
| Build | Vite `^7.2.4` | Dev server and static bundle |
| Styling | Tailwind CSS `^3.4.19` + PostCSS | Utility and token-driven UI |
| Icons | lucide-react `^0.562.0` | Consistent interface icons |
| Utilities | clsx, tailwind-merge | Class composition |
| Testing | Vitest `^3.2.4` | Domain behavior tests |
| Quality | ESLint `^9.39.5` | Static checks |
| Hosting | Cloudflare static assets via `wrangler.jsonc` | Production delivery |
| CI/CD | GitHub Actions | npm install, lint, test, build |

## 3. Runtime and packages

Node.js 20 is the CI runtime; npm and the committed `package-lock.json` are the only package workflow. `autoprefixer` and `postcss` are build-time dependencies and must remain installed through `npm ci`. Do not hand-edit the lockfile or introduce a second toolchain.

## 4. Frontend architecture

The app is a Vite SPA rendered entirely in the browser. State is local React state, persistence is a small `useInventory` hook, and deterministic rules live in `src/lib/medications.ts`, `inventory.ts`, `metrics.ts`, and `storage.ts`. UI is divided into reusable `ui` components and domain components. There is no router because the product is a single screen.

## 5. Data, security, and boundaries

Browser `localStorage` is the only persistence boundary. Stored JSON is untrusted and is parsed/validated before entering React state. No authentication or authorization is claimed; records are local to the browser and are not a server backup. No environment variables or secrets are required. The client contains no privileged credentials or external service integration.

## 6. Hosting and delivery

`vite build` emits `dist`; `wrangler.jsonc` points static asset delivery at that directory. The known public demo is `https://inventory.leonemarcos.com/`. Production crawler files are emitted from `public/`: `robots.txt`, `sitemap.xml`, `llms.txt`, and `_headers`. The repository does not deploy from CI in this checkout; deployment ownership remains the configured Cloudflare project.

## 7. Testing and quality

Required local gates are `npm test -- --run`, `npm run lint`, and `npm run build`. The build includes TypeScript project compilation. Unit tests cover status precedence, overlapping categories, stock rules, search, metrics, and malformed local-storage records. A browser smoke pass must cover initial render, opening a form, validation, stock movement error, deletion confirmation, responsive layout, and crawler-file responses when browser tooling is available.

## 8. CI/CD

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`, uses Node 20, runs `npm ci`, lint, tests, and build, and does not force-push or deploy. Any future browser test must be added only if its maintenance cost is justified by regression risk.

## 9. Performance

The app ships self-hosted Inter/Manrope WOFF2 fonts, a small WebP mark, and no remote runtime data requests. Keep the initial bundle simple, preserve stable layout dimensions, respect reduced motion, and measure before adding memoization, code splitting, or services.

## 10. Dependency and architectural policy

Reuse the current React/Vite/Tailwind stack before adding dependencies. Do not add a backend, database, auth provider, state-management library, CSS framework, ORM, analytics service, or client-side secret. Keep business rules out of presentation components and keep storage parsing at the trust boundary.

## 11. Technical decisions

| Date | Decision | Alternatives | Reason | Impact |
| --- | --- | --- | --- | --- |
| 2026-09-04 | Keep local browser persistence instead of adding a backend. | API, database, Supabase | No multi-user or server requirement exists for this portfolio demo. | Smaller deployment and explicit local-data boundary. |
| 2026-09-04 | Validate stored records before rendering. | Trust parsed JSON | Browser storage can be stale, manually edited, or corrupt. | Prevents malformed data from crashing the dashboard. |

## 12. Stack conformance audit

**Audit date:** 2026-09-04
**Overall status:** PASS WITH WARNINGS

| Area | Specification | Implementation | Severity | Action |
| --- | --- | --- | --- | --- |
| Runtime | npm lockfile and Node 20 CI | Manifest, lockfile, and CI agree; local dependencies were repaired with `npm ci` | Low | Keep Node version visible in contributor docs |
| Security | No secrets and validated storage boundary | No env vars or privileged service; stored medication records are validated | Low | Re-run full dependency audit when registry access is responsive |
| Testing | Domain tests plus build/lint | 21 tests, lint, and build pass after clean install | Low | Add browser regression gate only when justified |
| Delivery | Static output and crawler files | `dist` contains Vite output and public metadata files after build | Low | Verify provider responses after the next publish |

### Conclusion

The repository conforms to a small client-only React/Vite stack with no unnecessary infrastructure or duplicate technical solutions. The remaining warnings concern provider-side verification and optional browser automation.
