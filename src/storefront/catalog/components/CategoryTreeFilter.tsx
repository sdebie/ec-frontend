import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useCategoryTree, type CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

interface CategoryTreeFilterProps {
  activeSlug: string
  setFilter: (key: string, value: string) => void
}

const indentClasses = ['pl-0', 'pl-4', 'pl-8', 'pl-12']

/**
 * Ids of every ancestor of the active category (inclusive). These stay expanded
 * regardless of manual toggling so the current selection is always visible.
 */
function findActivePathIds(nodes: CategoryNode[], activeSlug: string): ReadonlySet<string> {
  const path = new Set<string>()
  if (!activeSlug) return path

  function walk(node: CategoryNode, ancestors: string[]): boolean {
    if (node.slug === activeSlug) {
      ancestors.forEach((id) => path.add(id))
      path.add(node.id)
      return true
    }
    return node.children.some((child) => walk(child, [...ancestors, node.id]))
  }

  nodes.some((node) => walk(node, []))
  return path
}

/**
 * Category filter tree. Roots render collapsed — the full UVH taxonomy is 137
 * categories across 23 roots, which rendered flat made the sidebar ~2.4x taller
 * than the product grid it filters. Each row carries the NavDrawer's dual
 * affordance: the name filters, the chevron expands.
 */
export function CategoryTreeFilter({ activeSlug, setFilter }: CategoryTreeFilterProps) {
  const { tree } = useCategoryTree()
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())

  const activePathIds = useMemo(() => findActivePathIds(tree, activeSlug), [tree, activeSlug])

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function renderNode(node: CategoryNode, depth: number) {
    const indent = indentClasses[Math.min(depth, 3)]
    const isActive = activeSlug === node.slug
    const hasChildren = node.children.length > 0
    const isExpanded = expandedIds.has(node.id) || activePathIds.has(node.id)

    return (
      <div key={node.id}>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setFilter('category', node.slug)}
            className={`flex-1 text-left py-1.5 text-sm ${indent} ${
              isActive
                ? 'font-semibold text-(--sf-accent)'
                : 'text-(--sf-text) hover:text-(--sf-accent)'
            }`}
          >
            {node.name}
          </button>
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggle(node.id)}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
              className="shrink-0 p-1 text-(--sf-muted-text) hover:text-(--sf-accent)"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <button
        type="button"
        onClick={() => setFilter('category', '')}
        className={`block w-full text-left py-1.5 text-sm ${
          activeSlug === ''
            ? 'font-semibold text-(--sf-accent)'
            : 'text-(--sf-text) hover:text-(--sf-accent)'
        }`}
      >
        All Categories
      </button>
      {tree.map((node) => renderNode(node, 0))}
    </div>
  )
}
