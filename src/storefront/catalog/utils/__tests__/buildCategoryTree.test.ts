import { describe, expect, it } from 'vitest'
import { buildCategoryTree, type CategoryInput } from '../buildCategoryTree'

describe('buildCategoryTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildCategoryTree([])).toEqual([])
  })

  describe('all-root categories (no parents)', () => {
    it('produces flat root list sorted alphabetically by name', () => {
      const cats: CategoryInput[] = [
        { id: '1', name: 'Bravo', slug: 'bravo', parent: null },
        { id: '2', name: 'Alpha', slug: 'alpha', parent: null },
        { id: '3', name: 'Charlie', slug: 'charlie' },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree).toHaveLength(3)
      expect(tree[0].name).toBe('Alpha')
      expect(tree[1].name).toBe('Bravo')
      expect(tree[2].name).toBe('Charlie')
      expect(tree.every((node) => node.children.length === 0)).toBe(true)
    })
  })

  describe('single parent-child relationship', () => {
    it('nests child under parent', () => {
      const cats: CategoryInput[] = [
        { id: 'parent-1', name: 'Electronics', slug: 'electronics', parent: null },
        { id: 'child-1', name: 'Phones', slug: 'phones', parent: { id: 'parent-1' } },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('parent-1')
      expect(tree[0].children).toHaveLength(1)
      expect(tree[0].children[0].id).toBe('child-1')
      expect(tree[0].children[0].name).toBe('Phones')
    })
  })

  describe('multi-level nesting', () => {
    it('builds correct hierarchy across three levels', () => {
      const cats: CategoryInput[] = [
        { id: 'root', name: 'Root', slug: 'root', parent: null },
        { id: 'mid', name: 'Middle', slug: 'middle', parent: { id: 'root' } },
        { id: 'leaf', name: 'Leaf', slug: 'leaf', parent: { id: 'mid' } },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('root')
      expect(tree[0].children).toHaveLength(1)
      expect(tree[0].children[0].id).toBe('mid')
      expect(tree[0].children[0].children).toHaveLength(1)
      expect(tree[0].children[0].children[0].id).toBe('leaf')
      expect(tree[0].children[0].children[0].children).toHaveLength(0)
    })

    it('preserves total node count across all levels', () => {
      const cats: CategoryInput[] = [
        { id: '1', name: 'A', slug: 'a', parent: null },
        { id: '2', name: 'B', slug: 'b', parent: { id: '1' } },
        { id: '3', name: 'C', slug: 'c', parent: { id: '2' } },
        { id: '4', name: 'D', slug: 'd', parent: { id: '1' } },
      ]

      const tree = buildCategoryTree(cats)

      const countNodes = (nodes: typeof tree): number =>
        nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0)

      expect(countNodes(tree)).toBe(4)
    })
  })

  describe('orphan handling', () => {
    it('treats categories with non-existent parent as roots', () => {
      const cats: CategoryInput[] = [
        { id: '1', name: 'Valid Root', slug: 'valid-root', parent: null },
        { id: '2', name: 'Orphan', slug: 'orphan', parent: { id: 'non-existent-id' } },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree).toHaveLength(2)
      expect(tree.find((n) => n.id === '2')).toBeDefined()
      expect(tree.find((n) => n.id === '2')!.name).toBe('Orphan')
    })

    it('never drops categories — orphans become roots alongside valid roots', () => {
      const cats: CategoryInput[] = [
        { id: '1', name: 'Root', slug: 'root', parent: null },
        { id: '2', name: 'Child', slug: 'child', parent: { id: '1' } },
        { id: '3', name: 'Orphan A', slug: 'orphan-a', parent: { id: 'missing-1' } },
        { id: '4', name: 'Orphan B', slug: 'orphan-b', parent: { id: 'missing-2' } },
      ]

      const tree = buildCategoryTree(cats)

      const countNodes = (nodes: typeof tree): number =>
        nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0)

      expect(countNodes(tree)).toBe(4)
      expect(tree).toHaveLength(3) // Root, Orphan A, Orphan B
    })
  })

  describe('alphabetical sort', () => {
    it('sorts root categories alphabetically by name', () => {
      const cats: CategoryInput[] = [
        { id: '1', name: 'Zebra', slug: 'zebra', parent: null },
        { id: '2', name: 'Apple', slug: 'apple', parent: null },
        { id: '3', name: 'Mango', slug: 'mango', parent: null },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree.map((n) => n.name)).toEqual(['Apple', 'Mango', 'Zebra'])
    })

    it('sorts children alphabetically by name within each parent', () => {
      const cats: CategoryInput[] = [
        { id: 'parent', name: 'Parent', slug: 'parent', parent: null },
        { id: 'c', name: 'Zulu', slug: 'zulu', parent: { id: 'parent' } },
        { id: 'a', name: 'Alpha', slug: 'alpha', parent: { id: 'parent' } },
        { id: 'b', name: 'Beta', slug: 'beta', parent: { id: 'parent' } },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree[0].children.map((n) => n.name)).toEqual(['Alpha', 'Beta', 'Zulu'])
    })

    it('sorts at every nesting level', () => {
      const cats: CategoryInput[] = [
        { id: 'root', name: 'Root', slug: 'root', parent: null },
        { id: 'mid-b', name: 'Bravo', slug: 'bravo', parent: { id: 'root' } },
        { id: 'mid-a', name: 'Alpha', slug: 'alpha', parent: { id: 'root' } },
        { id: 'leaf-z', name: 'Zulu', slug: 'zulu', parent: { id: 'mid-a' } },
        { id: 'leaf-a', name: 'Able', slug: 'able', parent: { id: 'mid-a' } },
      ]

      const tree = buildCategoryTree(cats)

      expect(tree[0].children[0].name).toBe('Alpha')
      expect(tree[0].children[1].name).toBe('Bravo')
      expect(tree[0].children[0].children[0].name).toBe('Able')
      expect(tree[0].children[0].children[1].name).toBe('Zulu')
    })
  })
})
