import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {getCartSessionStorageKey} from '@/utils/storefront/tenantStorageKeys'
import {env} from '@/lib/env'
import App from './App.jsx'

// Log storefront configuration on app load
console.log('[Frontend Bootstrap] VITE_STORE_FRONT:', import.meta.env.VITE_STORE_FRONT ?? 'not set');
console.log('[Frontend Bootstrap] Resolved storefront tenant:', env.storefrontTenant);
console.log('[Frontend Bootstrap] Storefront build target:', env.storefrontBuildTarget);

// Ensure a persistent cart session id exists on app load
function ensureCartSessionId() {
    try {
        if (typeof window === 'undefined' || !('localStorage' in window)) return;
        const ls = window.localStorage;
        const cartSessionKey = getCartSessionStorageKey();
        let sessionId = ls.getItem(cartSessionKey);
        if (!sessionId) {
            const simpleUuid = () =>
                'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            const uuid = (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function')
                ? window.crypto.randomUUID()
                : simpleUuid();
            ls.setItem(cartSessionKey, uuid);
        }
    } catch (e) {
        // Non-fatal: if localStorage is blocked or unavailable, just continue
        console.warn('[cart] Failed to ensure tenant cart session id:', e);
    }
}

ensureCartSessionId();

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <App/>
        </StrictMode>,
    )
}
