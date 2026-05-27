# Storefront E2E smoke (Phase C)

These tests target **`forge-projects/ec-frontend`** against a **running storefront + backend**. They are **not** executed in this workspace snapshot (no API / PayFast sandbox).

## Prerequisites

1. **Backend / GraphQL** reachable from the browser origin you test against (the app proxies `/api` to `http://localhost:8080` in dev — align your stack).
2. **Playwright browsers**: `npx playwright install` (once per machine).
3. **Tenant bundle**: storefront tenant is selected at **build time** with `VITE_STORE_FRONT` (`default` or `uvh`). Rebuild when switching tenants.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Origin under test (default `http://127.0.0.1:3000`). |
| `TEST_TENANT` | Optional runbook tag only — **does not** switch tenants at runtime. |

## Typical flows

**Development server**

```bash
cd forge-projects/ec-frontend
VITE_STORE_FRONT=default npm run dev
# in another terminal:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 TEST_TENANT=default npx playwright test
```

**Production-like preview**

```bash
VITE_STORE_FRONT=uvh npm run build
npm run preview -- --host 127.0.0.1 --port 4173
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 TEST_TENANT=uvh npx playwright test
```

## Notes

- **PayFast** is intentionally **skipped** as a separate placeholder test until sandbox credentials and redirect assertions are available.
- **`/payment-success`** in the smoke spec uses a **dummy** `sessionId` only to assert the page shell; replace with a real session after a PayFast return when you have ITN + polling working end-to-end.
