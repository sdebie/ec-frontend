import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useCategoryTree } from '@/storefront/catalog/hooks/useCategoryTree'
import { SF_FOCUS_RING } from '@/storefront/sections/shared/focusRing'

export function CategoryMegaMenu() {
  const { tree, isError } = useCategoryTree()
  const [panelOpen, setPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!panelOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPanelOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [panelOpen])

  // Close on outside click
  useEffect(() => {
    if (!panelOpen) return

    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [panelOpen])

  if (isError || tree.length === 0) return null

  return (
    // Not `relative`: the panel must anchor to the positioned header element
    // so it spans the full header width below the nav bar.
    <div ref={containerRef} className="hidden md:block">
      <button
        ref={triggerRef}
        onClick={() => setPanelOpen((v) => !v)}
        aria-expanded={panelOpen}
        aria-controls="category-mega-menu-panel"
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-(--sf-nav-text) hover:bg-(--sf-nav-border) ${SF_FOCUS_RING.nav}${panelOpen ? ' bg-(--sf-nav-border)' : ''}`}
      >
        Shop by Category
        <ChevronDown
          className={`h-4 w-4 transition-transform${panelOpen ? ' rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {panelOpen && (
        <div
          id="category-mega-menu-panel"
          role="region"
          aria-label="Category navigation"
          className="absolute left-0 right-0 top-full z-40 max-h-[75vh] overflow-y-auto border-b border-(--sf-border) bg-(--sf-panel) text-(--sf-text) shadow-lg"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3 lg:grid-cols-4">
              {tree.map((root) => (
                <div key={root.id}>
                  <Link
                    to={`/products?category=${root.slug}`}
                    className={`block text-sm font-semibold text-(--sf-text) hover:text-(--sf-accent) ${SF_FOCUS_RING.nav}`}
                    onClick={() => setPanelOpen(false)}
                  >
                    {root.name}
                  </Link>
                  {root.children.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {root.children.slice(0, 12).map((child) => (
                        <li key={child.id}>
                          <Link
                            to={`/products?category=${child.slug}`}
                            className={`block text-sm text-(--sf-muted-text) hover:text-(--sf-accent) ${SF_FOCUS_RING.nav}`}
                            onClick={() => setPanelOpen(false)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                      {root.children.length > 12 && (
                        <li>
                          <Link
                            to={`/products?category=${root.slug}`}
                            className={`block text-sm font-medium text-(--sf-accent) hover:underline ${SF_FOCUS_RING.nav}`}
                            onClick={() => setPanelOpen(false)}
                          >
                            View all
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
