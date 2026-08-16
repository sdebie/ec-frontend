import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Puts every storefront navigation back at the top of the page.
 *
 * Without this the browser keeps the previous scroll offset, so following a link
 * from halfway down one page drops you halfway down the next. It belongs here
 * rather than on the links themselves: an `onClick` that calls `scrollTo` fires
 * BEFORE the route changes, so it races the navigation, and it only ever covers
 * the links that remember to carry it.
 *
 * Keyed on `pathname` ALONE, deliberately. Search params change on every
 * catalogue filter, sort and page step; scrolling there would yank the user to
 * the top mid-interaction and fight `ProductListPage`, which already scrolls
 * explicitly when it wants to.
 *
 * `useLayoutEffect` + instant (not smooth) scroll: this must land before paint,
 * so the new page never flashes at the old offset, and a page arrival should
 * simply START at the top rather than animate there from somewhere else.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
