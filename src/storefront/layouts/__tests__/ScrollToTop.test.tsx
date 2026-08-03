import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { ScrollToTop } from '../ScrollToTop'

describe('ScrollToTop', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
    })

    function renderAt(initialEntries: string[]) {
        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <ScrollToTop />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <Link to="/products">Products</Link>
                                <Link to="/?page=2">Same page, new query</Link>
                            </>
                        }
                    />
                    <Route path="/products" element={<p>Catalogue</p>}/>
                </Routes>
            </MemoryRouter>,
        )
    }

    it('scrolls to the top when the pathname changes', async () => {
        const user = userEvent.setup()
        renderAt(['/'])
        vi.mocked(window.scrollTo).mockClear()

        await user.click(document.querySelector('a[href="/products"]')!)

        // Instant, not smooth: a page arrival should START at the top rather
        // than animate there from wherever the previous page was scrolled to.
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    })

    it('does NOT scroll when only the query string changes', async () => {
        const user = userEvent.setup()
        renderAt(['/'])
        vi.mocked(window.scrollTo).mockClear()

        await user.click(document.querySelector('a[href="/?page=2"]')!)

        // Catalogue filters, sorting and pagination all move only the search
        // params; scrolling here would yank the shopper mid-interaction.
        expect(window.scrollTo).not.toHaveBeenCalled()
    })

    it('scrolls on the initial render so a deep link starts at the top', () => {
        renderAt(['/products'])
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    })
})
