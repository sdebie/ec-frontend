import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryTreeFilter } from '../CategoryTreeFilter'

vi.mock('@/storefront/catalog/hooks/useCategoryTree')
import { useCategoryTree } from '@/storefront/catalog/hooks/useCategoryTree'

const mockedUseCategoryTree = vi.mocked(useCategoryTree)

const mockTree = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    children: [
      {
        id: '2',
        name: 'Phones',
        slug: 'phones',
        children: [
          {
            id: '3',
            name: 'Smartphones',
            slug: 'smartphones',
            children: [
              { id: '4', name: 'Android', slug: 'android', children: [] },
            ],
          },
        ],
      },
    ],
  },
]

describe('CategoryTreeFilter', () => {
  const defaultProps = {
    activeSlug: '',
    setFilter: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseCategoryTree.mockReturnValue({
      tree: mockTree,
      isLoading: false,
      isError: false,
    })
  })

  describe('indentation classes by depth', () => {
    it('applies pl-0 to root (depth 0) categories', () => {
      render(<CategoryTreeFilter {...defaultProps} />)

      const electronicsButton = screen.getByRole('button', { name: 'Electronics' })
      expect(electronicsButton.className).toContain('pl-0')
    })

    it('applies pl-4 to depth 1 children', () => {
      render(<CategoryTreeFilter {...defaultProps} />)

      const phonesButton = screen.getByRole('button', { name: 'Phones' })
      expect(phonesButton.className).toContain('pl-4')
    })

    it('applies pl-8 to depth 2 children', () => {
      render(<CategoryTreeFilter {...defaultProps} />)

      const smartphonesButton = screen.getByRole('button', { name: 'Smartphones' })
      expect(smartphonesButton.className).toContain('pl-8')
    })

    it('caps indentation at pl-12 for depth 3+ children', () => {
      render(<CategoryTreeFilter {...defaultProps} />)

      const androidButton = screen.getByRole('button', { name: 'Android' })
      expect(androidButton.className).toContain('pl-12')
    })

    it('caps indentation at pl-12 for depth 4+ children', () => {
      const deepTree = [
        {
          id: '1',
          name: 'Level 0',
          slug: 'level-0',
          children: [
            {
              id: '2',
              name: 'Level 1',
              slug: 'level-1',
              children: [
                {
                  id: '3',
                  name: 'Level 2',
                  slug: 'level-2',
                  children: [
                    {
                      id: '4',
                      name: 'Level 3',
                      slug: 'level-3',
                      children: [
                        { id: '5', name: 'Level 4', slug: 'level-4', children: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
      mockedUseCategoryTree.mockReturnValue({
        tree: deepTree,
        isLoading: false,
        isError: false,
      })

      render(<CategoryTreeFilter {...defaultProps} />)

      const level4Button = screen.getByRole('button', { name: 'Level 4' })
      expect(level4Button.className).toContain('pl-12')
      expect(level4Button.className).not.toContain('pl-16')
    })
  })

  describe('selection fires setFilter', () => {
    it('calls setFilter with the correct slug when a category is clicked', async () => {
      const user = userEvent.setup()
      const setFilter = vi.fn()
      render(<CategoryTreeFilter {...defaultProps} setFilter={setFilter} />)

      await user.click(screen.getByRole('button', { name: 'Electronics' }))

      expect(setFilter).toHaveBeenCalledWith('category', 'electronics')
    })

    it('calls setFilter with nested category slug when clicked', async () => {
      const user = userEvent.setup()
      const setFilter = vi.fn()
      render(<CategoryTreeFilter {...defaultProps} setFilter={setFilter} />)

      await user.click(screen.getByRole('button', { name: 'Phones' }))

      expect(setFilter).toHaveBeenCalledWith('category', 'phones')
    })
  })

  describe('"All Categories" row', () => {
    it('renders an "All Categories" button', () => {
      render(<CategoryTreeFilter {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'All Categories' })).toBeInTheDocument()
    })

    it('calls setFilter with empty string when "All Categories" is clicked', async () => {
      const user = userEvent.setup()
      const setFilter = vi.fn()
      render(<CategoryTreeFilter {...defaultProps} setFilter={setFilter} />)

      await user.click(screen.getByRole('button', { name: 'All Categories' }))

      expect(setFilter).toHaveBeenCalledWith('category', '')
    })

    it('shows selected state on "All Categories" when activeSlug is empty', () => {
      render(<CategoryTreeFilter {...defaultProps} activeSlug="" />)

      const allCategoriesButton = screen.getByRole('button', { name: 'All Categories' })
      expect(allCategoriesButton.className).toContain('font-semibold')
    })

    it('does not show selected state on "All Categories" when activeSlug is set', () => {
      render(<CategoryTreeFilter {...defaultProps} activeSlug="electronics" />)

      const allCategoriesButton = screen.getByRole('button', { name: 'All Categories' })
      expect(allCategoriesButton.className).not.toContain('font-semibold')
    })
  })

  describe('active slug highlighting', () => {
    it('highlights the button matching activeSlug with font-semibold', () => {
      render(<CategoryTreeFilter {...defaultProps} activeSlug="electronics" />)

      const electronicsButton = screen.getByRole('button', { name: 'Electronics' })
      expect(electronicsButton.className).toContain('font-semibold')
    })

    it('does not highlight buttons that do not match activeSlug', () => {
      render(<CategoryTreeFilter {...defaultProps} activeSlug="electronics" />)

      const phonesButton = screen.getByRole('button', { name: 'Phones' })
      expect(phonesButton.className).not.toContain('font-semibold')
    })
  })

  describe('empty tree', () => {
    it('renders only "All Categories" button when tree is empty', () => {
      mockedUseCategoryTree.mockReturnValue({
        tree: [],
        isLoading: false,
        isError: false,
      })

      render(<CategoryTreeFilter {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveTextContent('All Categories')
    })
  })
})
