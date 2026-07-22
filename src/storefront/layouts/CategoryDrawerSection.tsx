import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCategoryTree, type CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

interface CategoryDrawerSectionProps {
  onClose: () => void
}

export function CategoryDrawerSection({ onClose }: CategoryDrawerSectionProps) {
  const { tree, isError } = useCategoryTree()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  if (isError || tree.length === 0) return null

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function renderNode(node: CategoryNode, depth: number = 0) {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedIds.has(node.id)

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-2"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            <>
              <Link
                to={`/products?category=${node.slug}`}
                onClick={onClose}
                className="flex-1 text-sm text-(--sf-text) hover:text-(--sf-accent)"
              >
                {node.name}
              </Link>
              <button
                onClick={() => toggleExpanded(node.id)}
                aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                className="p-1 text-(--sf-muted-text) hover:text-(--sf-text)"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </>
          ) : (
            <Link
              to={`/products?category=${node.slug}`}
              onClick={onClose}
              className="flex-1 text-sm text-(--sf-text) hover:text-(--sf-accent)"
            >
              {node.name}
            </Link>
          )}
        </div>
        {hasChildren && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="border-t border-(--sf-border) pt-4 mt-2">
      <h3 className="px-0 text-xs font-semibold uppercase tracking-wider text-(--sf-muted-text) mb-2">
        Categories
      </h3>
      {tree.map((node) => renderNode(node))}
    </div>
  )
}
