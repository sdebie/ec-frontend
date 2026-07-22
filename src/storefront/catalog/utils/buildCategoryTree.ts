export interface CategoryNode {
  id: string
  name: string
  slug: string
  children: CategoryNode[]
}

export interface CategoryInput {
  id: string
  name: string
  slug: string
  parent?: { id: string } | null
}

/**
 * Transforms a flat array of categories (each with an optional parent reference)
 * into a tree of CategoryNode[].
 *
 * Algorithm:
 * 1. Build a Map<id, CategoryNode> from the flat list (children initially empty).
 * 2. For each category with a non-null parent.id, look up the parent in the map.
 *    If found, push the node into parent.children. If not found (orphan), treat as root.
 * 3. Roots = categories where parent is null OR orphaned.
 * 4. Sort roots and children alphabetically by name.
 *
 * Invariant: total node count in output === input array length (no drops).
 */
export function buildCategoryTree(categories: CategoryInput[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>()

  // Step 1: Create all nodes
  for (const cat of categories) {
    nodeMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      children: [],
    })
  }

  const roots: CategoryNode[] = []

  // Step 2 & 3: Attach children to parents; orphans become roots
  for (const cat of categories) {
    const node = nodeMap.get(cat.id)!
    const parentId = cat.parent?.id ?? null

    if (parentId === null) {
      roots.push(node)
    } else {
      const parentNode = nodeMap.get(parentId)
      if (parentNode) {
        parentNode.children.push(node)
      } else {
        // Orphan: parent.id references non-existent category → treat as root
        roots.push(node)
      }
    }
  }

  // Step 4: Sort roots and all children alphabetically by name
  const sortByName = (a: CategoryNode, b: CategoryNode) => a.name.localeCompare(b.name)

  roots.sort(sortByName)

  const sortChildren = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      if (node.children.length > 0) {
        node.children.sort(sortByName)
        sortChildren(node.children)
      }
    }
  }

  sortChildren(roots)

  return roots
}
