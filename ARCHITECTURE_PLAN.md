# EC-Frontend Architecture Evolution Plan

**Goal:** Evolve the codebase from "well-architected MVP for 2 tenants" into a production multi-tenant platform with three auth realms (admin / customer / wholesaler), DB-backed content, and a surface-aware component system.

**Principle:** No big-bang rewrites. Every phase is independently shippable. Pause between any two phases without leaving the codebase in a broken state.

---

## Phase 0 — Foundation Cleanup (1–2 weeks)

Pure hygiene and quick wins. Zero architectural risk. Land first to clear noise.

| Task | Owner | Done when |
|---|---|---|
| Delete `.DS_Store` files in `src/`, `src/storefront/`, `src/pages/storefront/`. Add `**/.DS_Store` to `.gitignore`. | Eng | `git status` clean on macOS |
| Delete `src/components/shared/imageupload/ImageUploadExamples.tsx` (zero imports) | Eng | File gone, build green |
| Delete or relocate empty `src/state/CurrencyContext.ts` | Eng | Either gone or moved into `src/context/` |
| Remove `.env` from git; switch to `.env.local` (gitignored) + CI env vars | DevOps | `git ls-files | grep -i env` returns only `.env.example` |
| Resolve duplicate checkout: confirm which of `src/pages/storefront/core/default/cart/Checkout.tsx` vs `src/pages/storefront/default/checkout/Checkout.tsx` is wired into the registry; delete the loser, or rename for clarity if both intentional | Eng | One canonical checkout path; route tests pass |
| Add Zod runtime schema for `StorefrontClientConfig`; validate at bootstrap | Eng | Misconfigured tenant fails fast with helpful error |
| Add build-time assertion that `pages.variants.*` values exist in the page registry | Eng | Typo in variant key fails CI, not silently falls back |
| Memoize `navigationRegistry` route scans | Eng | No re-scan on every render |
| Convert hardcoded reset-prefix list in `tenantLifecycle.ts` into a self-registration registry | Eng | New stores register their own cleanup; no central list to maintain |
| Add a one-line comment to dual `resetTenantScopedState()` calls in `StorefrontProvider.tsx` explaining intent | Eng | Reviewer can tell why it's called twice |
| Add comment to `authorizationHelper.ts`: "UI gating only — backend authoritative" | Eng | Comment present; ideally a unit test asserts on it |

**Exit criteria:** Repo is hygiene-clean, dead code removed, no behavior change, CI green.

---

## Phase 1 — Config Restructure (1 week)

Mechanical refactor of `StorefrontClientConfig` shape. No DB yet. Lays the groundwork for every later phase.

**Target shape:**

```ts
StorefrontClientConfig = {
  identity:        { id, displayName, hostnames, defaultLocale, defaultCurrency, timezone }
  realms:          { admin, customer, wholesaler }    // each: { enabled, ...realmOpts }
  features:        { reviews, wishlist, multiCurrency, quoteRequests, ... }
  variants:        { pages, layouts }                  // code-only
  contentDefaults: { schemaVersion, branding, theme, navigation, footer, pages }
  integrations:    { payfast, analytics }              // env-overridable
}
```

**Tasks:**
- Update `StorefrontClientConfig` type
- Restructure `theme` from 13 flat keys into nested `surface` / `brand` / `nav` namespaces
- Add `schemaVersion: 1` to `contentDefaults`
- Migrate `defaultStorefrontConfig.ts` and `clientUvhStorefrontConfig.ts` to new shape
- Update all consumers (StorefrontProvider, navigation registry, footer, theme injection)
- Update Zod schema from Phase 0
- All existing tests pass; add new tests for the nested theme shape

**Exit criteria:** Same UI behavior, new file shape, tests green.

---

## Phase 2 — Surface-Aware Primitives (2 weeks)

The unlock for everything else: collapse the `Sf*` / admin-token duplication into one set of components that adapt to context.

**Tasks:**
1. Introduce `SurfaceContext` + `<SurfaceProvider surface="admin|storefront|wholesale">`
2. Refactor CSS layer so each surface defines `--c-bg`, `--c-text`, `--c-border`, `--c-accent`, etc. — components reference `--c-*`, not `--admin-*` or `--sf-*`
3. Wrap layouts in the right surface: `AdminLayout` → `surface="admin"`, `StorefrontLayout` → `surface="storefront"`, future `WholesaleLayout` → `surface="wholesale"`
4. Replace `AdaptiveCard` with a true shared `Card` that uses `--c-*`
5. Refactor `PageContainer` to consume `useSurface()` and use `--c-*` tokens
6. Adopt `cva` (class-variance-authority) for variant + size enums on Button, Card, Input
7. Adopt slot composition: `<Card.Header>`, `<Card.Body>`, `<Card.Footer>` instead of prop explosions
8. Add polymorphic `as` prop to Button and Container (renders as `<a>`, `<Link>`, `<button>` as needed)
9. Collapse `SfButton`/`SfCard`/`SfInput` into the shared equivalents; delete the `Sf*` files
10. Add `data-density="compact|comfortable"` at the surface level so admin can be denser than storefront with the same primitives
11. Visual regression check: storefront and admin look unchanged

**Exit criteria:** One `Card`, one `Button`, one `Input`, one `Container` — three skins via surface tokens. `Sf*` files deleted.

---

## Phase 3 — Section Registry Pattern (1–2 weeks)

Shift home page (and any future page) from "TS array of imported components" to "data + registry." Still in code; no DB yet. This is the pattern that makes admin editing possible later.

**Tasks:**
1. Create `sectionRegistry: { [kind]: { component, schema (Zod) } }` for: `hero`, `featured`, `categoryPreview`, `benefits`, `testimonials`, `newsletter`, `cta`, `promoGrid`
2. Define a `SectionInstance` type: `{ id, kind, order, props }`
3. Convert `defaultHomeSections` from a TS component array to a `SectionInstance[]` literal in `contentDefaults.pages.home.sections`
4. Build a `<SectionRenderer sections={...} />` that sorts by order, looks up the component, validates props against the kind's schema, renders
5. Repeat for `uvh` sections
6. Each section component now takes typed props instead of being self-contained — refactor as needed
7. Tests: render every section kind with sample props; assert schema validation catches bad props

**Exit criteria:** `defaultHomeSections.ts` is data, not imports. The renderer is the only place that knows about React components.

---

## Phase 4 — Content API Contract (1 week)

Wire the frontend to read content from an API endpoint, but the API still returns `contentDefaults` (no DB yet). Decouples frontend from backend timeline.

**Tasks:**
1. Define API contract: `GET /api/storefront/content` → `{ schemaVersion, branding, theme, navigation, footer, pages }`
2. Backend stub: returns the tenant's `contentDefaults` from a hardcoded source (or in-memory map keyed by tenant ID)
3. Frontend: in `useStorefrontBootstrap`, fetch content in parallel with route mount; on success populate `StorefrontProvider` state; on failure fall back to `contentDefaults` from the bundled config
4. Cache: 5–10 min TTL keyed by `tenantId + schemaVersion`; bust on user action (later phase)
5. Inject theme tokens into `<style>` setting CSS vars on the surface root
6. Tests: bootstrap with API success, API failure, schema mismatch

**Exit criteria:** Frontend now reads everything DB-bound from an API; behavior identical to today; ready for a real backend swap.

---

## Phase 5 — Database Migration (2–3 weeks, backend-led)

Move the API stub from Phase 4 to a real DB-backed implementation. Frontend already adapted, so this is purely backend.

**Schema:**
```sql
storefront_content (tenant_id PK, schema_version, branding jsonb, theme jsonb,
                    navigation jsonb, footer jsonb, updated_at, updated_by)

storefront_pages   (tenant_id, page_key, schema_version, sections jsonb,
                    updated_at, updated_by, PK(tenant_id, page_key))

storefront_drafts  (tenant_id, page_key, sections jsonb, updated_at, updated_by,
                    PK(tenant_id, page_key))
```

**Tasks:**
- Migrations + seed scripts that import `contentDefaults` for every registered tenant
- Read endpoints implemented (replace stub from Phase 4)
- Write endpoints (admin-protected, role-gated)
- Migration framework for `schemaVersion` bumps (rename a token? write a migration)
- Frontend cache invalidation: include `Last-Modified` or version header so client knows when to refetch
- Backup/restore strategy documented

**Exit criteria:** All content reads come from DB; admins can hit write endpoints with curl and see changes propagate.

---

## Phase 6 — Admin Editor: Branding + Theme (2 weeks)

Lowest-risk admin UI to ship first. Proves the editor pattern.

**Tasks:**
- New admin page: `/admin/storefront/branding`
  - Form: name, tagline, logo upload (image upload component already exists)
- New admin page: `/admin/storefront/theme`
  - Color pickers grouped by namespace (surface / brand / nav)
  - Live preview pane (iframe of storefront with draft theme injected)
- Save flow: PATCH content endpoint → invalidate cache → toast confirm
- Optimistic UI: form shows new state immediately; reverts on save failure
- Audit log entry per save (`updated_by`, `updated_at`)

**Exit criteria:** Admin can change brand name, logo, and theme colors and see them live on the storefront within seconds, no deploy.

---

## Phase 7 — Admin Editor: Navigation + Footer (1–2 weeks)

**Tasks:**
- `/admin/storefront/navigation` — drag-to-reorder menu builder; add/edit/delete items; URL validation
- `/admin/storefront/footer` — column editor (heading + links), social link editor (icon picker), legal link editor
- Same save/preview/audit pattern as Phase 6

**Exit criteria:** All footer + nav text and structure editable from admin.

---

## Phase 8 — Admin Editor: Page Sections (3–4 weeks)

The big one. Builds on the Phase 3 section registry.

**Tasks:**
- `/admin/storefront/pages/home` — section list with drag-to-reorder
- "Add section" picker driven by `sectionRegistry` keys
- Per-section editor form auto-generated from each section's Zod schema (use a JSON-Schema → form library or roll a small one for your supported field types)
- Draft → Publish workflow:
  - Save → writes to `storefront_drafts`
  - Preview → renders storefront with draft sections
  - Publish → copies draft to `storefront_pages`, bumps version
- Per-section preview thumbnail in the list view
- Conflict handling: warn if another admin edited the same page since draft started

**Exit criteria:** Admin can fully recompose the home page (and later: any page) without a developer.

---

## Phase 9 — Auth Realm Expansion (3–5 weeks)

**Customer realm (2–3 weeks):**
- New Zustand slice: `customerAuthStore` with persisted token under `customer_token`
- Routes under `/account/*`: register, login, password reset, account dashboard, order history, addresses
- `useCustomerAuthState` bootstrap hook
- Customer-scoped storage keys (extend tenant lifecycle registry from Phase 0)
- Route guard: `<RequireRealm realm="customer">`

**Wholesaler realm (2 weeks, after customer):**
- Wholesaler auth slice mirroring customer
- Routes under `/wholesale/*` (or `/portal/*`): registration with approval workflow, dashboard, quote requests, tier pricing display
- `b2bMode` flag in `StorefrontProvider` flipped when wholesaler is logged in
- Storefront components consume `b2bMode` to swap price displays, expose quote-cart, show tier indicator
- Configurable per tenant: `realms.wholesaler.enabled` + `requireApproval`

**Exit criteria:** All three realms work independently; one user can be logged in to all three at once without state collisions.

---

## Phase 10 — Security Hardening (1–2 weeks, interleavable)

Can run in parallel with Phase 6+ once Phase 0 lands.

**Tasks:**
- Move all auth tokens from localStorage to `HttpOnly; Secure; SameSite=Strict` cookies set by backend
- Frontend stops reading/writing tokens directly; all auth state derived from `/me` endpoints
- Confirm backend re-validates authority on every privileged request (don't trust frontend role claims)
- Extract Payfast endpoint to env var; gate localhost fallback on `import.meta.env.DEV`
- Confirm Payfast signature generation is server-side only; remove any frontend signing code
- Verify GraphQL client propagates auth (or use cookie auth uniformly)
- Ship CSP headers from the host (no `unsafe-inline`, no `unsafe-eval`); ship HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- Pen-test pass on the three auth flows

**Exit criteria:** OWASP top-10 review passes; tokens never touch JS; CSP enforced.

---

## Phase 11 — Build & Ops (1 week)

**Tasks:**
- Make `build:tenant-matrix` actually emit `dist/{tenantId}/` per tenant
- CI step: `verify:storefront` runs against every tenant in the registry, not just `default` and `uvh`
- Per-tenant Docker image tags or per-tenant ConfigMaps for Kubernetes
- Health check endpoints
- Tenant-scoped logging context (request logs include `tenantId`)
- Rollback runbook per tenant

**Exit criteria:** Adding a new tenant is: drop a config + run `npm run build:newclient` + deploy. No manual CI tweaks.

---

## Phase 12 — Decoupling & Long-Term Hardening (ongoing)

Lower-priority but worth doing:
- Wrap Vite virtual-module imports behind a `storefrontModuleLoader` interface (bundler portability)
- Per-tenant feature-flag service with tenant context
- i18n hook scoped to `tenant.identity.defaultLocale`
- A/B section experiments (same kind, two prop variants, weighted render)
- Storybook for shared primitives (validates the surface-aware pattern)

---

## Sequencing Summary

```
Phase 0  ───▶ Phase 1  ───▶ Phase 2  ───▶ Phase 3  ───▶ Phase 4  ───▶ Phase 5
                                                                          │
                  Phase 10 (security) runs in parallel from Phase 0       │
                                                                          ▼
                                  Phase 6 ───▶ Phase 7 ───▶ Phase 8  ◀────┘

Phase 9 (auth realms) can start any time after Phase 2 (surface primitives)
Phase 11 (build/ops) any time after Phase 1
```

---

## Definition of Done for the Whole Plan

- One codebase, multi-tenant builds, per-client deploys
- Three auth realms with clean separation and no shared state
- All branding, theme, navigation, footer, and page composition editable from admin with draft/publish workflow
- One set of surface-aware primitives — no `Sf*` duplication
- Tokens in HttpOnly cookies; no client-side authority decisions
- Adding a new tenant is config + build + deploy, no code changes to shared layer
- Schema versioning in place so future config changes don't break existing tenants

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Surface refactor breaks existing tenant visuals | Visual regression tests before/after Phase 2; ship behind a feature flag if needed |
| DB migration corrupts seed content | Backup before migrate; idempotent seeders; staged rollout per tenant |
| Section schema migration on rename | `schemaVersion` field + migration scripts gate every breaking change |
| Wholesaler portal scope creep | Lock MVP to: register/approve, tier pricing display, quote request. Defer punch-out, NET terms, account hierarchy |
| Admin editor performance with large section lists | Virtualize the section list; lazy-load section preview thumbnails |
| Token migration to HttpOnly cookies breaks admin sessions | Roll out per realm; log users out cleanly with a banner explaining the security upgrade |
