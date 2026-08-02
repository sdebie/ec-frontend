import { useLayoutEffect, useRef } from 'react'

/**
 * Publishes the measured height of the storefront chrome (announcement bar +
 * header) as `--sf-chrome-h` on the layout root, so a section can size itself
 * against the space actually left below the fold.
 *
 * Measured rather than hardcoded because the chrome height is client-driven and
 * responsive: the announcement bar collapses below `md` when it carries no
 * message, the header wraps in a mobile search row, and a client that seeds no
 * nav renders neither. A fixed offset would be wrong for most of those.
 *
 * The chrome is measured as the gap between the layout root and `<main>` rather
 * than by wrapping the bar and header in a container — the header is
 * `sticky top-0` when the client enables `stickyHeader`, and a wrapper only as
 * tall as the chrome would confine the sticky to it and unstick the header on
 * the first scroll.
 *
 * Attach `rootRef` to the layout root and `mainRef` to `<main>`; consumers read
 * `var(--sf-chrome-h, 0px)`, so the fallback covers the pre-measure frame.
 */
export function useChromeHeight() {
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const main = mainRef.current
    if (!root || !main) return

    let published = ''

    const publish = () => {
      const height = main.getBoundingClientRect().top - root.getBoundingClientRect().top
      const next = `${Math.max(0, Math.round(height))}px`
      // Only write on change — this runs from a ResizeObserver, and a
      // same-value write still costs a style recalculation.
      if (next === published) return
      published = next
      root.style.setProperty('--sf-chrome-h', next)
    }

    publish()

    // jsdom has no ResizeObserver and does no layout, so the measurement is
    // meaningless there — publish once and skip the observer rather than
    // forcing every layout test to carry a stub.
    if (typeof ResizeObserver === 'undefined') return

    // documentElement catches the viewport-driven changes that move `<main>`
    // without resizing it — chiefly the announcement bar collapsing at `md`.
    const observer = new ResizeObserver(publish)
    observer.observe(document.documentElement)
    observer.observe(main)

    return () => observer.disconnect()
  }, [])

  return { rootRef, mainRef }
}
