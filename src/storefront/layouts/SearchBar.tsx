import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className }: SearchBarProps) {
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
      <div className="flex items-center rounded-md border border-gray-300 bg-white focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="flex shrink-0 items-center justify-center px-3 py-2 text-gray-500 hover:text-gray-700"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
