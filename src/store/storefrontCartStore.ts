/**
 * Re-export for non-cart modules that need the cart singleton without tripping
 * `import/no-restricted-paths` (e.g. `features/checkout` → `features/cart`).
 */
export {cartStore} from '@/features/cart/cartStore.ts';
