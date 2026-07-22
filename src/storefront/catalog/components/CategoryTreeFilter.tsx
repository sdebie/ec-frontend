import { useCategoryTree, type CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

interface CategoryTreeFilterProps {
  activeSlug: string
  setFilter: (key: string, value: string) => void
}

const indentClasses = ['pl-0', 'pl-4', 'pl-8', 'pl-12']

export function CategoryTreeFilter({ activeSlug, setFilter }: CategoryTreeFilterProps) {
  const { tree } = useCategoryTree()

  function renderNode(node: CategoryNode, depth: number) {
    const indent = indentClasses[Math.min(depth, 3)]
    const isActive = activeSlug === node.slug

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => setFilter('category', node.slug)}
          className={`block w-full text-left py-1.5 text-sm ${indent} ${
            isActive
              ? 'font-semibold text-(--sf-accent)'
              : 'text-(--sf-text) hover:text-(--sf-accent)'
          }`}
        >
          {node.name}
        </button>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div>
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
