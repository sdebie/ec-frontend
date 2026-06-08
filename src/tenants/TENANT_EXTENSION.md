# Tenant Extension Guide

This document describes every supported extension point for adding or customising a storefront client. Each tenant lives in `src/tenants/{tenantId}/` and is driven by a single config file. Nothing outside that folder needs to change for most customisations.

---

## 1. Creating a new tenant

1. Create `src/tenants/{tenantId}/config.ts` exporting a `StorefrontClientConfig` as a **named export called `storefrontConfig`** — this is the convention the Vite plugin enforces:

```ts
// src/tenants/acme/config.ts
import type { StorefrontClientConfig } from '@/types/storefront/storefrontTypes';

export const storefrontConfig: StorefrontClientConfig = {
  id: 'acme',
  // ...
};
```

2. Register the tenant's hostnames in `config.hostnames`.
3. Run `vite build` (or `vite dev`) — the Vite plugin scans `src/tenants/*/config.ts` automatically.

To build only one tenant: `VITE_STORE_FRONT={tenantId} vite build`.

---

## 2. `StorefrontClientConfig` fields

```ts
export interface StorefrontClientConfig {
  id: string;                    // unique tenant identifier
  displayName: string;           // human-readable name
  hostnames: string[];           // production hostnames that route to this tenant
  locale?: string;               // BCP-47 locale for number/date formatting (e.g. 'en-ZA')
  defaultCountryCode?: string;   // ISO 3166-1 alpha-2 (e.g. 'ZA')
  stickyHeader?: boolean;
  branding: StorefrontBranding;
  navigation: StorefrontNavigation;
  theme: StorefrontTheme;
  pages?: { variants?: ...; cms?: ... };
  routes?: { extra?: TenantExtraRoute[] };
  slots?: StorefrontSlotContribution[];
  home?: { sections: StorefrontSectionConfig[] };
  footer: FooterConfig;
}
```

---

## 3. Page variants (`config.pages.variants`)

Override any canonical page with a tenant-specific implementation.

```ts
pages: {
  variants: {
    home: 'uvh-home',          // key: StorefrontPageKey, value: variant token
    productDetail: 'uvh-product-detail',
  },
}
```

**Resolution order** (first match wins):

1. Variant token looked up in `storefrontPageVariantRegistry` (built by Vite from `tenants/*/pages/*/page.tsx`).
2. Convention page: `tenants/{tenantId}/pages/{pageKey}/page.tsx`.
3. Default page: `tenants/default/pages/{pageKey}/page.tsx`.
4. Route-level fallback component.

**Adding a variant:**

1. Create `src/tenants/{tenantId}/pages/{pageKey}/page.tsx` with a default export.
2. Set `config.pages.variants[pageKey] = '{tenantId}-{pageKey}'`.
3. The Vite virtual-module plugin picks it up on the next dev restart / build.

Available page keys are defined in `src/types/storefront/storefrontPageKeys.ts`.

---

## 4. Extra routes (`config.routes.extra`)

Add tenant-exclusive routes that have no canonical page key.

```ts
routes: {
  extra: [
    { key: 'franchise', path: '/franchise' },
    { key: 'loyalty',   path: '/loyalty', meta: { layout: 'plain' } },
  ],
}
```

The router resolves each key via the convention registry:
`tenants/{tenantId}/pages/{key}/page.tsx`.

`meta.layout` controls which storefront shell wraps the page (`default` | `plain` | `full` | `shop`). Omit to use the default layout.

---

## 5. Slots (`config.slots`)

Inject content into named layout slots without modifying shared components.

```ts
slots: [
  {
    id: 'uvh-promo-bar',
    slot: 'layout.header',   // see StorefrontSlotId for all available slots
    order: 10,
    content: { title: 'Free delivery on orders over R500' },
  },
]
```

Available slot IDs are defined in `StorefrontSlotId` in `src/types/storefront/storefrontTypes.ts`.

**Shell-level slots** — rendered automatically by `StorefrontShell` without any page-component changes:

| Slot ID | Position |
|---|---|
| `layout.header` | Above the page header — full-bleed banners |
| `layout.below-header` | Between header and `<main>` — announcement/promo bars |
| `layout.footer` | Below the footer — cookie banners, legal notices |
| `store.nav` | Between header and `<main>` — secondary navigation bars |

**Page-level slots** — place `<StorefrontSlot slotId="…" storefrontConfig={…} />` inside the relevant page component to activate:

| Slot ID | Suggested position |
|---|---|
| `product.above-purchase` | Product detail, above the add-to-cart panel |
| `cart.above-checkout` | Cart view, above the checkout button |

**Custom slots** — any string is a valid slot ID. Define your own in `config.slots` and render it with `<StorefrontSlot slotId="my.custom.slot" … />` in your tenant page component. TypeScript will still provide autocomplete for the well-known IDs above.

---

## 6. CSS token rules

The platform uses a four-layer token system. Respecting layer boundaries keeps theming portable across tenants and prevents style bleed.

| Layer | Variables | Who sets it | Where it applies |
|---|---|---|---|
| **Primitives** | `--c-*` | `[data-surface]` attribute | All primitives and shared components |
| **Storefront runtime** | `--sf-*` | `StorefrontThemeProvider` (from `config.theme`) | Storefront surface only |
| **Admin** | `--admin-*` | `index.css` + `AdminThemeContext` | Admin surface only |
| **Tailwind theme** | `--color-*` | `index.css @theme` | Utility classes |

**Rules by file location:**

| Location | Allowed | Forbidden |
|---|---|---|
| `primitives/` | `--c-*` only | `--sf-*`, `--admin-*`, hardcoded colours |
| `components/shared/` | `--c-*` | `--admin-*`, `--sf-*`, tenant-scoped classes |
| `components/storefront/` | `--c-*`, `--sf-*` | `--admin-*` |
| `tenants/{id}/` | `--sf-*`, `--c-*` | `--admin-*` |
| `features/` | `--c-*`, `--sf-*` | `--admin-*` |
| `pages/admin/`, `components/layout/admin/` | `--admin-*`, `--c-*` | `--sf-*` |

**Theming a new tenant:**

All per-tenant colours are injected at runtime via `StorefrontThemeProvider`. Set values in `config.theme` — no CSS file changes needed for standard theming:

```ts
theme: {
  background: '#f3f4f6',
  panel: '#ffffff',
  accent: '#7a0019',
  accentText: '#ffffff',
  // ... see StorefrontTheme for all fields
}
```

For structural CSS that cannot be expressed as tokens (custom animations, unique layout patterns), create `tenants/{tenantId}/theme.css`. Keep it to CSS custom property overrides and `@keyframes` only — never write selectors that reference admin or shared component class names.

---

## 7. Tenant-specific components and sections

Custom components belong in `tenants/{tenantId}/components/`. Prefix them with the tenant name to prevent collision:

```
tenants/uvh/components/UvhTitleHero.tsx       ✓
tenants/uvh/components/HeroSection.tsx        ✗  (collides with default sections)
```

If you need to override a default section (HeroSection, AboutSection, ContentSection, UtilityBanner), create the override inside your page file or in `tenants/{tenantId}/components/` with a tenant prefix — do not create a `tenants/{tenantId}/sections/` folder with identical names to the defaults.

Default sections that are available without override:

| Component | Import |
|---|---|
| `HeroSection` | `@/tenants/default/sections/HeroSection` |
| `AboutSection` | `@/tenants/default/sections/AboutSection` |
| `ContentSection` | `@/tenants/default/sections/ContentSection` |
| `UtilityBanner` | `@/tenants/default/sections/UtilityBanner` |

---

## 8. Service and type boundaries

Tenant and feature code must not import directly from `services/graphql/admin/` or `types/admin/`. Use the shared surfaces instead:

| Need | Import from |
|---|---|
| Product types | `@/types/shared/ProductTypes` |
| Category / Brand types | `@/types/shared/CategoryTypes`, `@/types/shared/BrandTypes` |
| Settings / shipping types | `@/types/shared/SettingsTypes` |
| Category queries | `@/services/graphql/category/category.service` |
| Brand queries | `@/services/graphql/brand/brand.service` |
| Shipping / store settings | `@/services/StoreSettings` |
| Product queries | `@/services/graphql/product/product.service` |
