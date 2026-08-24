import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useAdminTestimonials} from '../testimonials/hooks/useAdminTestimonials'
import {useCreateTestimonial} from '../testimonials/hooks/useCreateTestimonial'
import {useUpdateTestimonial} from '../testimonials/hooks/useUpdateTestimonial'
import {useDeleteTestimonial} from '../testimonials/hooks/useDeleteTestimonial'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {TestimonialsPage} from '../TestimonialsPage'

vi.mock('../testimonials/hooks/useAdminTestimonials', () => ({
    useAdminTestimonials: vi.fn(),
}))
vi.mock('../testimonials/hooks/useCreateTestimonial', () => ({
    useCreateTestimonial: vi.fn(),
}))
vi.mock('../testimonials/hooks/useUpdateTestimonial', () => ({
    useUpdateTestimonial: vi.fn(),
}))
vi.mock('../testimonials/hooks/useDeleteTestimonial', () => ({
    useDeleteTestimonial: vi.fn(),
}))


const mockTestimonials = [
    {
        id: '1',
        quote:
            'This is a great product with excellent quality and very good customer service that goes beyond expectations',
        authorName: 'John Smith',
        authorTitle: 'CEO, Acme Corp',
        published: true,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T09:30:00Z',
    },
    {
        id: '2',
        quote: 'Would recommend to everyone',
        authorName: 'Jane Doe',
        authorTitle: null,
        published: false,
        sortOrder: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
]

const mockMutate = vi.fn()
const defaultMutation = {mutate: mockMutate, isPending: false}

function createQueryClient() {
    return new QueryClient({defaultOptions: {queries: {retry: false}}})
}

function renderPage() {
    return render(
        <QueryClientProvider client={createQueryClient()}>
            <TestimonialsPage/>
        </QueryClientProvider>,
    )
}

describe('TestimonialsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAdminTestimonials).mockReturnValue({
            data: mockTestimonials,
            isLoading: false,
            error: null,
        } as any)
        vi.mocked(useCreateTestimonial).mockReturnValue(defaultMutation as any)
        vi.mocked(useUpdateTestimonial).mockReturnValue(defaultMutation as any)
        vi.mocked(useDeleteTestimonial).mockReturnValue(defaultMutation as any)
        useAdminAuthStore.setState({role: 'SUPER_ADMIN'})
    })

    it('renders all testimonials (published and unpublished) in the table', () => {
        renderPage()
        expect(screen.getByText(/John Smith/)).toBeInTheDocument()
        expect(screen.getByText(/Jane Doe/)).toBeInTheDocument()
        // StatusBadge renders "Published" and "Draft" within badge spans
        const badges = screen.getAllByText('Published')
        // At least one is the status badge (the other is the column header)
        expect(badges.length).toBeGreaterThanOrEqual(2)
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('truncates long quotes to ~80 characters', () => {
        renderPage()
        // The first quote is >80 chars, so it should be truncated with "..."
        const truncated = screen.getByText(/This is a great product.*\.\.\./)
        expect(truncated).toBeInTheDocument()
    })

    it('shows sort order values', () => {
        renderPage()
        // Find cells that contain the sort order values
        const cells = document.querySelectorAll('td')
        const cellTexts = Array.from(cells).map((c) => c.textContent?.trim())
        expect(cellTexts).toContain('1')
        expect(cellTexts).toContain('2')
    })

    it('shows a Last Updated column with each testimonial\'s formatted timestamp', () => {
        renderPage()
        expect(screen.getByText('Last Updated')).toBeInTheDocument()
        expect(screen.getByText(formatDateTime(mockTestimonials[0].updatedAt))).toBeInTheDocument()
        expect(screen.getByText(formatDateTime(mockTestimonials[1].updatedAt))).toBeInTheDocument()
    })

    describe('SUPER_ADMIN role', () => {
        beforeEach(() => {
            useAdminAuthStore.setState({role: 'SUPER_ADMIN'})
        })

        it('shows "Add Testimonial" button', () => {
            renderPage()
            expect(screen.getByRole('button', {name: /add testimonial/i})).toBeInTheDocument()
        })

        it('shows edit and delete action buttons', () => {
            renderPage()
            expect(screen.getByLabelText(/edit testimonial by john smith/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/delete testimonial by john smith/i)).toBeInTheDocument()
        })

        it('clicking delete shows confirmation dialog', async () => {
            renderPage()
            const user = userEvent.setup()
            await user.click(screen.getByLabelText(/delete testimonial by john smith/i))
            expect(screen.getByText('Delete Testimonial')).toBeInTheDocument()
            expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
        })

        it('double-clicking a row opens the edit form pre-filled with that testimonial\'s values', async () => {
            renderPage()
            const user = userEvent.setup()

            await user.dblClick(screen.getByText('John Smith'))

            expect(screen.getByText('Edit Testimonial')).toBeInTheDocument()
            expect(screen.getByLabelText(/quote/i)).toHaveValue(mockTestimonials[0].quote)
            expect(screen.getByLabelText(/author name/i)).toHaveValue('John Smith')
        })
    })

    describe('VIEWER role (read-only)', () => {
        beforeEach(() => {
            useAdminAuthStore.setState({role: 'VIEWER'})
        })

        it('does not show "Add Testimonial" button', () => {
            renderPage()
            expect(screen.queryByRole('button', {name: /add testimonial/i})).not.toBeInTheDocument()
        })

        it('does not show edit or delete action buttons', () => {
            renderPage()
            expect(screen.queryByLabelText(/edit testimonial/i)).not.toBeInTheDocument()
            expect(screen.queryByLabelText(/delete testimonial/i)).not.toBeInTheDocument()
        })
    })

    describe('form validation', () => {
        it('form rejects blank quote', async () => {
            renderPage()
            const user = userEvent.setup()

            // Open the create form
            await user.click(screen.getByRole('button', {name: /add testimonial/i}))

            // Fill authorName but leave quote blank
            await user.type(screen.getByLabelText(/author name/i), 'Test Author')

            // Submit the form
            await user.click(screen.getByRole('button', {name: /create/i}))

            await waitFor(() => {
                expect(screen.getByText('Quote is required')).toBeInTheDocument()
            })
        })

        it('form rejects blank authorName', async () => {
            renderPage()
            const user = userEvent.setup()

            // Open the create form
            await user.click(screen.getByRole('button', {name: /add testimonial/i}))

            // Fill quote but leave authorName blank
            await user.type(screen.getByLabelText(/quote/i), 'A great testimonial quote')

            // Submit the form
            await user.click(screen.getByRole('button', {name: /create/i}))

            await waitFor(() => {
                expect(screen.getByText('Author name is required')).toBeInTheDocument()
            })
        })
    })

    it('displays loading state via DataTable skeleton', () => {
        vi.mocked(useAdminTestimonials).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any)
        const {container} = renderPage()
        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
