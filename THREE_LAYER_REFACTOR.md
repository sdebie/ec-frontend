# Three-Layer Refactor Plan

**Goal:** Untangle `ec-frontend` into three clean layers — primitives, features, tenants — so the codebase is maintainable and adding a new client is config + composition, not a code fork.

**Companion doc:** `ARCHITECTURE_PLAN.md` already sequences the broader frontend evolution. This doc is narrower and concrete: it defines the target structure, the contracts between layers, a worked code sketch for the surface-aware primitives slice, and a migration order. Use both together — this doc is the *what it should look like*, that doc is the *broader sequencing*.

**Principle:** Build the new structure alongside the old, migrate feature by feature, delete the old when nothing imports it. No big-bang rename.

---

## 1. The three layers, in one paragraph

A **primitive** is a UI atom — Button, Card, Input — that knows nothing about tenants or business domain. It adapts to its surrounding *surface* (admin vs storefront vs wholesaler) via CSS custom properties set by a context provider. A **feature** is a domain capability — Checkout, Cart, ProductList, CustomerAuth — that lives **once**, is tenant-agnostic, and composes primitives. A **tenant** is a thin shell that picks which features to render and passes tenant-specific config (theme tokens, branding, payment methods, copy). Today, features are duplicated inside tenants and primitives are duplicated across surfaces. The fix is to extract features upward and collapse primitives inward.

---

## 2. Target file tree

```
src/
├─ app/                              # Bootstrap, providers, router (mostly unchanged)
│   ├─ bootstrap/
│   ├─ providers/
│   └─ router/
│
├─ primitives/                       # LAYER 1 — surface-aware UI atoms
│   ├─ surface/
│   │   ├─ SurfaceContext.tsx        # surface = admin | storefront | wholesaler
│   │   ├─ tokens.css                # --c-* tokens per surface
│   │   └─ index.ts
│   ├─ button/
│   │   ├─ Button.tsx                # ONE Button. cva variants. data-density aware.
│   │   ├─ Button.test.tsx
│   │   └─ index.ts
│   ├─ card/
│   │   ├─ Card.tsx                  # Slot-composed: Card, Card.Header, Card.Body, Card.Footer
│   │   └─ index.ts
│   ├─ input/
│   ├─ select/
│   ├─ container/
│   ├─ icon/
│   ├─ dialog/
│   ├─ drawer/
│   └─ index.ts                      # Public re-exports
│
├─ features/                         # LAYER 2 — tenant-agnostic domain capabilities
│   ├─ catalog/
│   │   ├─ ProductList.tsx
│   │   ├─ ProductDetail.tsx
│   │   ├─ ProductCard.tsx
│   │   ├─ hooks/
│   │   │   └─ useProducts.ts
│   │   ├─ services/
│   │   │   └─ product.queries.ts
│   │   ├─ types.ts
│   │   └─ index.ts
│   ├─ cart/
│   │   ├─ CartView.tsx
│   │   ├─ EmptyCart.tsx
│   │   ├─ CartSummary.tsx
│   │   ├─ cartStore.ts              # Zustand
│   │   ├─ hooks/
│   │   ├─ types.ts
│   │   └─ index.ts
│   ├─ checkout/
│   │   ├─ Checkout.tsx              # ONE Checkout, composed from sections
│   │   ├─ sections/
│   │   │   ├─ ContactInfoSection.tsx
│   │   │   ├─ ShippingMethodSection.tsx
│   │   │   ├─ PaymentMethodSection.tsx
│   │   │   └─ OrderSummarySection.tsx
│   │   ├─ hooks/
│   │   │   ├─ useCheckoutFlow.ts
│   │   │   └─ usePayfastRedirect.ts
│   │   ├─ services/
│   │   │   └─ checkout.api.ts
│   │   ├─ types.ts
│   │   └─ index.ts
│   ├─ auth/
│   │   ├─ admin/
│   │   ├─ customer/
│   │   └─ wholesaler/               # Phase 9 of ARCHITECTURE_PLAN
│   ├─ orders/
│   ├─ customers/
│   ├─ payments/
│   ├─ images/
│   ├─ bulk-import/
│   ├─ settings/
│   └─ index.ts
│
├─ tenants/                          # LAYER 3 — thin per-tenant shells
│   ├─ _template/                    # Copy this to bootstrap a new tenant
│   │   ├─ pages/
│   │   ├─ sections/
│   │   ├─ config.ts.template
│   │   └─ theme.css.template
│   ├─ default/
│   │   ├─ config.ts                 # StorefrontClientConfig
│   │   ├─ theme.css                 # Sets --sf-* tokens for this tenant
│   │   ├─ pages/
│   │   │   ├─ home.tsx              # 30–60 lines. Composes features + sections.
│   │   │   ├─ products.tsx
│   │   │   ├─ product-detail.tsx
│   │   │   ├─ cart.tsx
│   │   │   ├─ checkout.tsx
│   │   │   ├─ contact.tsx
│   │   │   ├─ about.tsx
│   │   │   ├─ wholesale-application.tsx
│   │   │   └─ index.ts
│   │   └─ sections/                 # Tenant-specific home page sections (eventually DB-driven)
│   │       ├─ Hero.tsx
│   │       ├─ FeaturedProducts.tsx
│   │       └─ defaultHomeSections.ts
│   └─ uvh/
│       ├─ config.ts
│       ├─ theme.css
│       ├─ pages/
│       └─ sections/
│
├─ admin/                            # The admin app — tenant-unaware in the per-deployment model
│   ├─ pages/
│   │   ├─ dashboard.tsx
│   │   ├─ products/
│   │   ├─ orders/
│   │   ├─ customers/
│   │   ├─ settings/
│   │   └─ ...
│   └─ layout/
│       └─ AdminLayout.tsx           # Wraps children in <SurfaceProvider surface="admin">
│
├─ shared/                           # Cross-cutting infra (not domain, not UI)
│   ├─ http/                         # axios base, interceptors
│   ├─ graphql/                      # GraphQL client, error utils
│   ├─ utils/
│   │   ├─ cn.ts
│   │   ├─ HostnameResolver.ts
│   │   └─ ...
│   ├─ types/                        # Truly cross-domain types only
│   └─ env/
│
└─ configs/                          # Registries (mostly unchanged)
    ├─ storefront/
    │   ├─ tenantRegistry.ts
    │   ├─ pageRegistry.ts
    │   └─ sectionRegistry.ts        # From Phase 3 of ARCHITECTURE_PLAN
    └─ routes/
```

What disappears, eventually:

- `components/shared/` and `components/storefront/` → merged into `primitives/`
- `pages/storefront/core/default/` → features extracted; folder deleted
- `pages/storefront/default/` and `pages/storefront/uvh/` → renamed and slimmed under `tenants/`
- `pages/admin/` → renamed to `admin/pages/`
- `state/`, `store/`, `context/` (current top-level) → state collocated with the feature that owns it, theme moved into `primitives/surface/`

---

## 3. Layer contracts

These are the rules that, if followed, keep the layers from re-tangling. ESLint can enforce most of them via `import/no-restricted-paths`.

**Primitives (`primitives/`)**
- May import from: `shared/utils`, other primitives, React, lucide-react, cva
- May NOT import from: `features/`, `tenants/`, `admin/`, `configs/`
- Must use `--c-*` CSS custom properties only — no `--admin-*`, no `--sf-*` directly
- Must work under any `<SurfaceProvider>`
- Must default to `comfortable` density unless `data-density="compact"` is set
- One component per concept. Variants via cva, not separate files.

**Features (`features/`)**
- May import from: `primitives/`, `shared/`, other files inside the same feature folder
- May NOT import from: other features, `tenants/`, `admin/`, `configs/`
- Take tenant-specific behavior as **props or context**, never read tenant config directly
- Own their state (Zustand store, hooks) — colocated, not in a global `store/`
- Own their data layer — services and queries live with the feature
- Public surface is `index.ts` — only export what consumers need

**Tenants (`tenants/{id}/`)**
- May import from: `features/`, `primitives/`, `shared/`, the tenant's own folder
- May NOT import from: other tenants
- Pages are **compositions** — target ≤100 lines per page file. If a page file grows past 200 lines, the logic belongs in a feature.
- A tenant has exactly four kinds of files: `config.ts`, `theme.css`, `pages/*`, `sections/*`
- Adding a tenant requires no changes outside `tenants/{newId}/` and one line in `tenantRegistry.ts`

**Admin (`admin/`)**
- Same rules as a tenant, but special: there's only one and it wraps in `<SurfaceProvider surface="admin">`
- May NOT import from `tenants/`

ESLint rule sketch:

```js
// eslint.config.js — import/no-restricted-paths (paths use ./src/… in-repo)
{
  zones: [
    { target: './src/primitives', from: './src/features' },
    { target: './src/primitives', from: './src/tenants' },
    { target: './src/primitives', from: './src/admin' },
    { target: './src/features', from: './src/tenants' },
    { target: './src/features', from: './src/admin' },
    // Feature isolation: one zone per top-level folder under src/features/ (see eslint.config.js
    // `featureTopLevelFolders`). A single `src/features/*` target does not match nested files
    // (e.g. features/cart/cartStore.ts) under eslint-plugin-import minimatch semantics.
    { target: '**/src/features/cart/**', from: '**/src/features/**', except: ['**/src/features/cart/**'] },
    // …repeat for auth, catalog, checkout, wholesale-application
    { target: './src/tenants/default', from: './src/tenants/uvh' },
    { target: './src/tenants/uvh', from: './src/tenants/default' },
  ]
}
```

**Verified:** zones apply to `@/` aliased imports on `.ts`/`.tsx` via `eslint-import-resolver-typescript` (`settings.import.resolver.typescript.project`) since 2026-05-09.

Lock these rules in early. They make the migration self-correcting — anyone trying to backslide gets a build error.

---

## 4. Worked example — surface-aware primitives

This is the slice you should start with. It's contained, it unblocks Phase 2 of `ARCHITECTURE_PLAN.md`, and it's the foundation that every feature extraction builds on.

### 4.1 SurfaceContext

```tsx
// src/primitives/surface/SurfaceContext.tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Surface = 'admin' | 'storefront' | 'wholesaler';
export type Density = 'compact' | 'comfortable';

interface SurfaceContextValue {
  surface: Surface;
  density: Density;
}

const SurfaceContext = createContext<SurfaceContextValue | null>(null);

export function useSurface(): SurfaceContextValue {
  const ctx = useContext(SurfaceContext);
  if (!ctx) {
    throw new Error('useSurface must be used inside <SurfaceProvider>');
  }
  return ctx;
}

interface SurfaceProviderProps {
  surface: Surface;
  density?: Density;
  children: ReactNode;
}

export function SurfaceProvider({
  surface,
  density = 'comfortable',
  children,
}: SurfaceProviderProps) {
  const value = useMemo(() => ({ surface, density }), [surface, density]);
  return (
    <SurfaceContext.Provider value={value}>
      <div data-surface={surface} data-density={density} className="contents">
        {children}
      </div>
    </SurfaceContext.Provider>
  );
}
```

### 4.2 Token map (single source of truth for colors / radii / shadows)

```css
/* src/primitives/surface/tokens.css */

/* Admin surface — drives admin app appearance */
[data-surface='admin'] {
  --c-bg:            #f8fafc;
  --c-panel:         #ffffff;
  --c-text:          #0f172a;
  --c-text-muted:    #64748b;
  --c-border:        #e2e8f0;
  --c-accent:        #2563eb;
  --c-accent-hover:  #1d4ed8;
  --c-accent-text:   #ffffff;
  --c-accent-subtle: #dbeafe;
  --c-ring:          #2563eb;
  --c-radius:        0.375rem;
  --c-shadow-sm:     0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Storefront surface — pulls from --sf-* set by the active tenant theme */
[data-surface='storefront'] {
  --c-bg:            var(--sf-background);
  --c-panel:         var(--sf-panel);
  --c-text:          var(--sf-text);
  --c-text-muted:    var(--sf-muted-text);
  --c-border:        var(--sf-border);
  --c-accent:        var(--sf-accent);
  --c-accent-hover:  var(--sf-accent-hover, var(--sf-accent));
  --c-accent-text:   var(--sf-accent-text);
  --c-accent-subtle: var(--sf-accent-subtle, color-mix(in srgb, var(--sf-accent) 20%, transparent));
  --c-ring:          var(--sf-ring, var(--sf-accent));
  --c-radius:        var(--sf-radius, 0.5rem);
  --c-shadow-sm:     var(--sf-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
}

/* Wholesaler surface — defined when Phase 9 lands */

/* Density modifiers */
[data-density='compact'] {
  --c-control-h-sm: 1.75rem;
  --c-control-h-md: 2rem;
  --c-control-h-lg: 2.5rem;
}

[data-density='comfortable'] {
  --c-control-h-sm: 2rem;
  --c-control-h-md: 2.5rem;
  --c-control-h-lg: 3rem;
}
```

The trick: every surface defines values for the **same** set of `--c-*` tokens. Components reference only `--c-*`. To skin a new surface, you add one CSS block.

### 4.3 Button — one component, every surface

```tsx
// src/primitives/button/Button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  // Base — uses --c-* tokens; surface-agnostic
  [
    'inline-flex items-center justify-center font-medium transition-colors',
    'rounded-(--c-radius)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
    'focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg)',
    'disabled:opacity-50 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        solid:
          'bg-(--c-accent) text-(--c-accent-text) hover:bg-(--c-accent-hover) shadow-[var(--c-shadow-sm)]',
        secondary:
          'border border-(--c-border) bg-(--c-panel) text-(--c-text) ' +
          'hover:border-(--c-accent) hover:text-(--c-accent) shadow-[var(--c-shadow-sm)]',
        outline:
          'border border-(--c-border) bg-transparent text-(--c-text) ' +
          'hover:bg-(--c-bg) hover:border-(--c-accent) hover:text-(--c-accent)',
        ghost:
          'text-(--c-text) hover:bg-(--c-bg) hover:text-(--c-accent)',
        plain:
          'text-(--c-text-muted) bg-transparent hover:text-(--c-text) underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-(--c-control-h-sm) px-3 text-xs',
        md: 'h-(--c-control-h-md) px-4 text-sm',
        lg: 'h-(--c-control-h-lg) px-6 text-base',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, loading, disabled, leftIcon, rightIcon, children, ...rest },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  )
);
Button.displayName = 'Button';
```

### 4.4 Card — slot composition

```tsx
// src/primitives/card/Card.tsx
import * as React from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  padded?: boolean;
}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ bordered = true, padded = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-(--c-panel) text-(--c-text) rounded-(--c-radius) shadow-[var(--c-shadow-sm)]',
        bordered && 'border border-(--c-border)',
        padded && 'p-4',
        className
      )}
      {...props}
    />
  )
);
CardRoot.displayName = 'Card';

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-3 pb-3 border-b border-(--c-border) font-semibold', className)} {...props} />
);

const CardBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-3 pt-3 border-t border-(--c-border)', className)} {...props} />
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
```

### 4.5 Usage — same components, different skins

```tsx
// admin/layout/AdminLayout.tsx
import { SurfaceProvider } from '@/primitives/surface';
import { Card, Button } from '@/primitives';

export function AdminLayout({ children }) {
  return (
    <SurfaceProvider surface="admin" density="compact">
      <Card>
        <Card.Header>Products</Card.Header>
        <Card.Body>{children}</Card.Body>
        <Card.Footer>
          <Button variant="solid" size="sm">Save</Button>
        </Card.Footer>
      </Card>
    </SurfaceProvider>
  );
}

// tenants/default/pages/cart.tsx
import { SurfaceProvider } from '@/primitives/surface';
import { Card, Button } from '@/primitives';
import { CartView } from '@/features/cart';

export default function CartPage() {
  return (
    <SurfaceProvider surface="storefront">
      <Card>
        <Card.Header>Your cart</Card.Header>
        <Card.Body><CartView /></Card.Body>
        <Card.Footer>
          <Button variant="solid">Checkout</Button>
        </Card.Footer>
      </Card>
    </SurfaceProvider>
  );
}
```

Same `Card`, same `Button`. Different appearance because the surface root sets different `--c-*` values. The `Sf*` files and the admin-only Button stop existing.

---

## 5. Worked example — what a tenant page looks like after extraction

Today's `pages/storefront/core/default/cart/Checkout.tsx` is **624 lines**. After feature extraction:

```tsx
// tenants/default/pages/checkout.tsx — target: ~30 lines
import { SurfaceProvider } from '@/primitives/surface';
import { Checkout } from '@/features/checkout';
import { useTenantConfig } from '@/configs/storefront';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const config = useTenantConfig();
  const navigate = useNavigate();

  return (
    <SurfaceProvider surface="storefront">
      <Checkout
        paymentMethodsConfig={config.payments}
        shippingMethodsSource="api"
        cartStorageKey={`ec_cart_${config.id}`}
        onPaymentSuccess={({ orderId }) => navigate(`/payment-success?orderId=${orderId}`)}
        onInStoreOrder={({ orderId }) => navigate(`/order-confirmation?orderId=${orderId}`)}
      />
    </SurfaceProvider>
  );
}
```

Inside `features/checkout/`, the actual flow lives once. UVH's checkout page becomes the same 30 lines with different config props. The 1,200 lines of duplicated checkout logic collapse into a single shared implementation.

That's the "feels cheap" payoff for adding a new client: their checkout page is 30 lines that pass their config into a shared feature.

---

## 6. Migration sequence

Five phases. Each is independently shippable. Pause between any two without leaving the codebase broken.

### Phase A — Hygiene gate (1 week)

Set up the rails so the rest of the work doesn't drift.

Add Prettier with a single config and run it across the repo. Add ESLint `import/order`, `import/no-restricted-paths` (with empty zones for now — fill them in as new folders appear), and `max-lines-per-file: 400` as a warning. Add path aliases to `tsconfig.json` and `vite.config.ts`: `@/primitives`, `@/features`, `@/tenants`, `@/admin`, `@/shared`, `@/configs`. Don't use them yet — just have them ready.

Delete dead code: `state/CurrencyContext.ts` (empty), `components/shared/imageupload/ImageUploadExamples.tsx` (zero imports), the duplicate Checkout (pick one — likely `pages/storefront/default/checkout/screens/Checkout.tsx` since it's newer-looking). Delete the duplicate `contact/` folder.

Lock in folder naming: kebab-case for directories (`shopping-cart` not `shoppingCart`), `pages/` for entry files, `sections/` for tenant-specific composed UI, `components/` only inside features. Rename outliers in one commit per area.

**Exit criteria:** Repo formatted, lint enforces the rails, dead code gone, one Checkout, naming consistent.

### Phase B — Surface-aware primitives (1–2 weeks)

This is the worked example above. Concretely:

Create `src/primitives/surface/` with `SurfaceContext.tsx` and `tokens.css`. Wire the existing `--admin-*` and `--sf-*` token values into the `--c-*` mapping inside `tokens.css`. Wrap `AdminLayout` in `<SurfaceProvider surface="admin" density="compact">`. Wrap `StorefrontShell` in `<SurfaceProvider surface="storefront">`.

Create `primitives/button/Button.tsx` (the cva version above). Update one consumer at a time to import from `@/primitives/button` instead of `@/components/shared/button` or `@/components/storefront/button`. Visual diff each consumer. Once nothing imports the old paths, delete the old files. Repeat for `Card`, `Input`, `Container`.

Run a visual regression pass — Playwright or just side-by-side screenshots of a few representative pages on admin, default storefront, and uvh storefront. Should look identical to before.

**Exit criteria:** `Sf*` and admin-only primitives gone. One `Button`, one `Card`, one `Input`, one `Container`. Three skins via tokens. Build green, visuals unchanged.

### Phase C — Extract features (1 feature per week, ~6–10 weeks total)

Order matters here — start with the highest-duplication, lowest-risk features and work toward the higher-risk ones once the pattern is solid.

1. **`features/cart/`** — Cart is small, well-isolated, mostly client-side. Move `store/CartStore.ts` and `pages/storefront/default/shoppingCart/components/*` into `features/cart/`. Tenant page becomes a 20-line composition.
2. **`features/catalog/`** — `ProductList`, `ProductDetail`, `ProductCard`. The two tenants currently have variant implementations; extract the shared logic, keep tenant-specific layout in `tenants/{id}/sections/`.
3. **`features/checkout/`** — The big one. With the duplicate already deleted in Phase A, you have one 559-line file to decompose. Split into `Checkout.tsx` + `sections/*` + `hooks/useCheckoutFlow.ts`. Each section file ≤200 lines. Tenant page is 30 lines.
4. **`features/auth/customer/`** — Build the customer auth realm Phase 9 calls for. Doing it inside `features/` from the start means it's automatically shared across tenants.
5. **`features/orders/`, `features/customers/`** — Mostly admin-facing. Migrate as you build admin order management (which doesn't exist yet — see ArchitectureAnalysis Risk #5).
6. **`features/payments/`** — PayFast plus the gateway abstraction (so you can add Ozow / iKhokha later without forking).
7. **`features/bulk-import/`** — Already well-structured; mostly a directory move.

For each feature, the work pattern is the same: create the feature folder, move the canonical implementation, refactor it to take config via props instead of importing tenant config, replace tenant imports, delete what's left of the old location. One feature = one PR.

**Exit criteria:** Every business capability lives in exactly one place under `features/`. `pages/storefront/core/default/` is empty and deleted.

### Phase D — Tenant cleanup (parallel with Phase C, 1 week of total work spread out)

As features get extracted, the tenant folders shrink. When a tenant folder is just `pages/`, `sections/`, `config.ts`, `theme.css`, rename it from `pages/storefront/{id}/` to `tenants/{id}/`. Delete `core/default/` once nothing references it. Move `pages/admin/` to `admin/pages/`.

Verify each tenant page is ≤100 lines. If any are longer, the logic belongs in a feature — go back to Phase C.

**Exit criteria:** `tenants/default/`, `tenants/uvh/`, `admin/`. No `pages/storefront/`. Tenant pages are thin compositions.

### Phase E — The "add a new client" payoff (1 week)

Now you make the workflow real.

Create `tenants/_template/` with a starter tenant: minimal `config.ts`, default `theme.css`, every page from `default` copied as a thin composition. This is the canonical "what a tenant looks like."

Write a small CLI: `npm run create-tenant -- --id=acme --name="Acme Co" --hostname=acme.com`. Under the hood it copies `_template/` to `tenants/acme/` and templates the config. Maybe 100 lines of Node.

Update the build pipeline (Phase 11 of `ARCHITECTURE_PLAN.md`): `build:tenant-matrix` actually emits `dist/{tenantId}/` per tenant. Per-tenant Docker tags ready for the K8s deployment scripts.

Document the workflow in `tenants/README.md`:

> Adding a new client:
> 1. `npm run create-tenant -- --id=acme --name="Acme" --hostname=acme.com`
> 2. Edit `tenants/acme/config.ts` (payment methods, shipping, branding)
> 3. Edit `tenants/acme/theme.css` (colors, radii)
> 4. Replace placeholder logo in `tenants/acme/assets/`
> 5. `VITE_STORE_FRONT=acme npm run build`
> 6. Deploy via the per-tenant Helm chart with your acme values

**Exit criteria:** A new tenant is config + theme, fits in a single PR review, and ships in a day not a sprint.

---

## 7. What "feels cheap to add a new client" actually means in practice

Today, adding a third tenant requires:

- A new `client{Name}StorefrontConfig.ts`
- A new `pages/storefront/{tenantId}/` directory tree with copies of every page
- Manual decisions about which pages copy from `default` and which need bespoke versions
- New entries in `storefrontRegistry.ts`, hostname mappings, and the build matrix
- Bespoke layouts and components that drift from default over time
- Inconsistent patterns to navigate — three folder conventions, two state stores, two button libraries

After this refactor:

- Run the create-tenant CLI
- Edit `config.ts` and `theme.css` (~50–100 lines of config total)
- Override page sections only where the client wants something genuinely custom (most won't)
- Build, deploy, done

The reason it feels cheap is that **features stop being copied**. The new tenant inherits Checkout, Cart, ProductList, Auth, Orders for free. They only diverge when there's a real business reason, and that divergence happens in `tenants/{id}/sections/`, not by forking the whole flow.

---

## 8. Risks and how to manage them

**Risk: visual regression during the primitive migration.**
Mitigation: do it consumer-by-consumer with screenshots. Start in admin where you have the most control over the surface. Don't migrate UVH pages until the storefront token mapping has been validated on `default`.

**Risk: feature extraction breaks tenant-specific behavior.**
Mitigation: every feature takes a `config` prop or hooks into context. If a tenant needs a behavior that isn't a config knob, that's a signal the feature needs an extension point — don't fork, add a slot or a render prop.

**Risk: the migration drags on indefinitely.**
Mitigation: ESLint zones in Phase A make new code go to the right place automatically. Old code gets fixed when it's touched. Aim for steady progress, not a freeze-and-rewrite.

**Risk: the duplicate Checkout has subtle behavior differences and you delete the wrong one.**
Mitigation: diff them carefully before Phase A. Track which routes hit which file. Keep the loser in git history.

**Risk: scope creep — someone tries to also fix the backend domain gaps from `ArchitectureAnalysis.md`.**
Mitigation: this refactor is frontend only. Critical backend bugs (shipping `@Transient`, PayFast ITN, password hashing) are a separate parallel track. Don't combine.

---

## 9. What NOT to do

Don't move all the files in one commit. Each phase is many small PRs.

Don't try to perfect the primitive API on day one. Ship a usable version, migrate consumers, refine from real usage.

Don't introduce a new state library. Zustand for feature state, Context for surface/theme. That's enough.

Don't import from `tenants/` into `features/`. The day a feature reads tenant config directly is the day the layers tangle again.

Don't copy a feature into a tenant folder for "tenant-specific tweaks." Add an extension point to the feature. If you can't, the extension point is the bug — fix that, not the symptom.

Don't gate the work on Phase 5 (DB-backed content) of the broader plan. The three-layer refactor is independent and should land first; DB content slots in cleanly afterward because `tenants/{id}/sections/` is already data-shaped.

---

## 10. Order of operations summary

```
Phase A — Hygiene gate                    (1 week)
   ↓
Phase B — Surface-aware primitives        (1–2 weeks)    ← worked example in §4
   ↓
Phase C — Extract features                (6–10 weeks, one feature per week)
   ↓                                      Cart → Catalog → Checkout → Auth → ...
Phase D — Tenant cleanup                  (parallel with C, ~1 week total)
   ↓
Phase E — "Add a new client" workflow     (1 week)
```

Total wall-clock estimate: 10–14 weeks for one engineer, 5–7 weeks for two engineers working in parallel on independent features. The codebase is shippable at every phase boundary.

---

## 11. Definition of done for the whole refactor

- One Button, one Card, one Input, one Container — driven by `--c-*` tokens and `<SurfaceProvider>`
- Every business capability lives once under `features/`, with no per-tenant copies
- Tenant pages are thin compositions, ≤100 lines each
- ESLint enforces import boundaries; the layers can't accidentally re-tangle
- Adding a new tenant is a CLI command + config edits + build flag
- `Sf*`, `AdaptiveCard`, the duplicate Checkouts, and `pages/storefront/core/default/` no longer exist
- The codebase looks the same shape whether you open `default`, `uvh`, or any future tenant
