import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

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
    button: 'text-(--sf-muted-text) hover:text-(--sf-text)',
  },
  nav: {
    container:
      'border border-transparent bg-(--sf-nav-border) text-(--sf-nav-text) focus-within:border-(--sf-ring) focus-within:ring-1 focus-within:ring-(--sf-ring)',
    input: 'placeholder:text-(--sf-nav-icon-text)',
    button: 'text-(--sf-nav-icon-text) hover:text-(--sf-nav-icon-text-hover)',
  },
}

export function SearchBar({ className, tone = 'panel' }: SearchBarProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const queryParam = params.get('q') ?? ''
  const [prevQuery, setPrevQuery] = useState(queryParam)
  const [value, setValue] = useState(queryParam)

  // Keep input in sync when ?q= changes from external navigation
  if (prevQuery !== queryParam) {
    setPrevQuery(queryParam)
    setValue(queryParam)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      navigate(`/products?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/products')
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className={`flex items-center rounded-md ${toneClasses[tone].container}`}>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className={`w-full bg-transparent px-3 py-1.5 text-sm outline-none ${toneClasses[tone].input}`}
        />
        <button
          type="submit"
          aria-label="Submit search"
          className={`flex shrink-0 items-center justify-center px-3 py-1.5 ${toneClasses[tone].button}`}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
