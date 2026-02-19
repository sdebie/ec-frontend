import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Ensure a persistent cart session id exists on app load
const CART_SESSION_KEY = 'cart_session_id';
function ensureCartSessionId() {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return;
    const ls = window.localStorage;
    let sessionId = ls.getItem(CART_SESSION_KEY);
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
      ls.setItem(CART_SESSION_KEY, uuid);
    }
  } catch (e) {
    // Non-fatal: if localStorage is blocked or unavailable, just continue
    console.warn('[cart] Failed to ensure cart_session_id:', e);
  }
}

ensureCartSessionId();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
