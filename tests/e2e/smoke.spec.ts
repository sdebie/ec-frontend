import { expect, test } from '@playwright/test';

/**
 * The active tenant is fixed at build time via `VITE_STORE_FRONT`.
 * `TEST_TENANT` is documentation-only for your runbook — it does not change the bundle.
 * Build: `VITE_STORE_FRONT=default npm run build` (or `uvh`), then serve (`npm run preview` or your host).
 */
const _tenantNote = (process.env.TEST_TENANT ?? 'default').trim().toLowerCase();
void _tenantNote;

test.describe('Phase C storefront smoke (real stack)', () => {
    test('products → PDP → cart badge → cart (qty) → checkout (in-store) → home', async ({ page }) => {
        page.on('dialog', (dialog) => {
            void dialog.accept();
        });

        await page.goto('/products');
        await expect(page.getByRole('heading').first()).toBeVisible();

        const firstPdpLink = page.locator('a[href^="/product/"]').first();
        await expect(firstPdpLink).toBeVisible();
        await firstPdpLink.click();
        await expect(page).toHaveURL(/\/product\//);

        const addToCart = page.getByRole('button', { name: /^add to cart$/i }).first();
        await expect(addToCart).toBeEnabled();
        await addToCart.click();

        await expect(page.getByLabel(/items in cart/i)).toBeVisible();

        await page.goto('/cart');
        await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();

        const quantity = page.getByRole('combobox', { name: /quantity/i }).first();
        if (await quantity.isVisible()) {
            const optionCount = await quantity.locator('option').count();
            if (optionCount > 1) {
                await quantity.selectOption({ index: 1 });
            }
        }

        await page.getByRole('button', { name: /^checkout$/i }).click();
        await expect(page).toHaveURL(/\/checkout/);

        await page.locator('#email-address').fill('smoke-test@example.com');

        await page.getByText(/pay in store/i).first().click();

        await page.getByRole('button', { name: /reserve.*pay in-store/i }).click();

        await expect.poll(async () => new URL(page.url()).pathname).toBe('/');

        await page.goto('/payment-success?sessionId=dummy-session-for-manual-run');
        await expect(page.getByRole('heading', { name: /verifying payment/i })).toBeVisible();
    });

    test.skip(true, 'PayFast hosted redirect — requires sandbox merchant credentials, return URLs, and browser redirect handling.');
});
