import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { SF_FOCUS_RING } from '@/storefront/sections/shared/focusRing'
import { SEARCH_PARAM } from '@/storefront/catalog/searchParams'

interface SearchBarProps {
  className?: string
  /** 'panel' (default) renders on panel surfaces (e.g. NavDrawer); 'nav' blends into the header via the --sf-nav-* tokens. */
  tone?: 'panel' | 'nav'
}

const toneClasses: Record<NonNullable<SearchBarProps['tone']>, { container: string; input: string; button: string }> = {
  panel: {
    container:
      'border border-(--sf-border) bg-(--sf-panel) text-(--sf-text) focus-within:border-(--sf-ring) focus-within:ring-1 focus-within:ring-(--sf-ring)',
    input: 'placeholder:text-(--sf-muted-text)',
    button: `text-(--sf-muted-text) hover:text-(--sf-text) rounded-md ${SF_FOCUS_RING.page}`,
  },
  nav: {
    container:
      'border border-transparent bg-(--sf-nav-border) text-(--sf-nav-text) focus-within:border-(--sf-ring) focus-within:ring-1 focus-within:ring-(--sf-ring)',
    input: 'placeholder:text-(--sf-nav-icon-text)',
    button: `text-(--sf-nav-icon-text) hover:text-(--sf-nav-icon-text-hover) rounded-md ${SF_FOCUS_RING.nav}`,
  },
}

/**
 * The chrome search box — header (desktop and mobile) and nav drawer.
 *
 * **It is a draft box, not a view of the applied search.** It holds only what is
 * being typed right now: submitting hands the term to the catalogue and empties
 * the box, and it never reads the URL back.
 *
 * The applied term lives in ONE place the shopper can see and edit — the filter
 * sidebar's Search field, alongside the chip that removes it. Do not make this
 * box mirror `?q=` as well: the same value in two controls leaves this one
 * populated after a search with no way to clear it from here, and a term typed
 * in the sidebar reappears up here as if it had been typed in the header.
 *
 * The consequence to keep in mind: this box going empty after a submit is NOT
 * the search being cleared. Nothing here revokes an applied search — that is the
 * sidebar field's and the chip's job — so `useSearchParams` is deliberately
 * absent and this component never writes to the URL except by navigating.
 */
export function SearchBar({ className, tone = 'panel' }: SearchBarProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    // Empty the box on the way out, so returning to the header never shows a
    // term that has already been handed over.
    setValue('')
    if (trimmed) {
      navigate(`/products?${SEARCH_PARAM}=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/products')
    }
  }

  /** Discards the half-typed draft. Deliberately does NOT touch an applied search. */
  function handleClear() {
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className={`flex items-center rounded-md ${toneClasses[tone].container}`}>
        {/*
          text-base below md, not text-sm: a phone needs the larger target, and
          an input under 16px makes iOS Safari zoom the whole viewport on focus
          — which is what made the header jump when the box was tapped.
          The WebKit cancel button is suppressed so it cannot sit beside ours.
        */}
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className={`w-full bg-transparent px-3 py-2.5 text-base outline-none md:py-1.5 md:text-sm [&::-webkit-search-cancel-button]:appearance-none ${toneClasses[tone].input}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={`flex shrink-0 items-center justify-center px-2 py-2.5 md:py-1.5 ${toneClasses[tone].button}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Submit search"
          className={`flex shrink-0 items-center justify-center px-3 py-2.5 md:py-1.5 ${toneClasses[tone].button}`}
        >
          <Search className="h-5 w-5 md:h-4 md:w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
