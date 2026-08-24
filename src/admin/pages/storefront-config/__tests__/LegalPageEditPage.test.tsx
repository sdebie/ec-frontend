import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {LegalPageEditPage} from '../LegalPageEditPage'
import {usePageContent} from '@/admin/hooks/pages/usePageContent'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

const mockSaveMutate = vi.fn()
const mockSaveMutateAsync = vi.fn()
const mockPublishMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useParams: () => ({id: 'page-1'}),
        useNavigate: () => mockNavigate,
    }
})

vi.mock('@/admin/context/BreadcrumbContext', () => ({
    useBreadcrumb: vi.fn(),
}))

vi.mock('@/admin/hooks/pages/usePageContent', () => ({
    usePageContent: vi.fn(),
}))

vi.mock('@/admin/hooks/pages/useSavePageDraft', () => ({
    useSavePageDraft: vi.fn(() => ({
        mutate: mockSaveMutate,
        mutateAsync: mockSaveMutateAsync,
        isPending: false,
    })),
}))

vi.mock('@/admin/hooks/pages/usePublishPage', () => ({
    usePublishPage: vi.fn(() => ({
        mutate: mockPublishMutate,
        isPending: false,
    })),
}))

vi.mock('@/shared/auth/adminAuthStore', () => ({
    useAdminAuthStore: vi.fn(),
}))

// Mock TipTap editor — render a simple textarea for testing
vi.mock('@/admin/components/RichTextEditor', () => ({
    RichTextEditor: ({value, onChange, disabled}: {
        value: string;
        onChange: (html: string) => void;
        disabled?: boolean
    }) => (
        <textarea
            data-testid="rich-text-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label="Rich text editor"
        />
    ),
}))

// --- Mock Data ---
const mockPageData = {
    id: 'page-1',
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    category: 'LEGAL',
    draftContent: '<p>Draft content here</p>',
    publishedContent: '<p>Published content here</p>',
    publishedAt: '2024-06-15T10:30:00Z',
    updatedAt: '2024-06-20T08:00:00Z',
}

// --- Helpers ---
function renderPage() {
    return render(
        <MemoryRouter>
            <LegalPageEditPage/>
        </MemoryRouter>,
    )
}

// --- Tests ---
describe('LegalPageEditPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default: SUPER_ADMIN role
        vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
            selector({role: 'SUPER_ADMIN'}),
        )
        mockSaveMutateAsync.mockResolvedValue(undefined)
    })

    describe('Initialises editor from draft content (Requirement 5.1)', () => {
        it('initialises editor with draftContent when available', async () => {
            vi.mocked(usePageContent).mockReturnValue({
                data: mockPageData,
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            renderPage()

            await waitFor(() => {
                const editor = screen.getByTestId('rich-text-editor')
                expect(editor).toHaveValue('<p>Draft content here</p>')
            })
        })

        it('falls back to publishedContent when draftContent is null', async () => {
            vi.mocked(usePageContent).mockReturnValue({
                data: {...mockPageData, draftContent: null},
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            renderPage()

            await waitFor(() => {
                const editor = screen.getByTestId('rich-text-editor')
                expect(editor).toHaveValue('<p>Published content here</p>')
            })
        })

        it('falls back to empty string when both draftContent and publishedContent are null', async () => {
            vi.mocked(usePageContent).mockReturnValue({
                data: {...mockPageData, draftContent: null, publishedContent: null},
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            renderPage()

            await waitFor(() => {
                const editor = screen.getByTestId('rich-text-editor')
                expect(editor).toHaveValue('')
            })
        })
    })

    describe('Save calls PUT only — no publish (Requirement 5.3)', () => {
        it('Save Draft calls useSavePageDraft.mutate with content and does NOT call publish', async () => {
            const user = userEvent.setup()
            vi.mocked(usePageContent).mockReturnValue({
                data: mockPageData,
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            renderPage()

            await waitFor(() => {
                expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
            })

            const saveButton = screen.getByRole('button', {name: /save draft/i})
            await user.click(saveButton)

            expect(mockSaveMutate).toHaveBeenCalledWith({
                id: 'page-1',
                content: '<p>Draft content here</p>',
            })
            expect(mockPublishMutate).not.toHaveBeenCalled()
        })
    })

    describe('Publish saves then publishes (Requirement 5.4)', () => {
        it('Publish opens confirmation dialog, then calls save and publish on confirm', async () => {
            const user = userEvent.setup()
            vi.mocked(usePageContent).mockReturnValue({
                data: mockPageData,
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            // Make publish mutate call onSuccess immediately
            mockPublishMutate.mockImplementation((_id: string, options?: { onSuccess?: () => void }) => {
                options?.onSuccess?.()
            })

            renderPage()

            await waitFor(() => {
                expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
            })

            // Click the Publish button in the header
            const publishButton = screen.getByRole('button', {name: /publish/i})
            await user.click(publishButton)

            // Confirmation dialog should be open
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
                expect(screen.getByText(/Are you sure you want to publish these changes/)).toBeInTheDocument()
            })

            // Click the confirm "Publish" button in the dialog
            const confirmButton = screen.getAllByRole('button', {name: /publish/i}).find(
                (btn) => btn.closest('[role="dialog"]')
            )!
            await user.click(confirmButton)

            await waitFor(() => {
                expect(mockSaveMutateAsync).toHaveBeenCalledWith({
                    id: 'page-1',
                    content: '<p>Draft content here</p>',
                    silent: true,
                })
                expect(mockPublishMutate).toHaveBeenCalled()
            })
        })
    })

    describe('VIEWER sees read-only editor, Save/Publish hidden (Requirement 4.4)', () => {
        it('hides Save Draft and Publish buttons for VIEWER', () => {
            vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
                selector({role: 'VIEWER'}),
            )
            vi.mocked(usePageContent).mockReturnValue({
                data: mockPageData,
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            renderPage()

            expect(screen.queryByRole('button', {name: /save draft/i})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /publish/i})).not.toBeInTheDocument()
        })

        it('renders editor as disabled for VIEWER', async () => {
            vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
                selector({role: 'VIEWER'}),
            )
            vi.mocked(usePageContent).mockReturnValue({
                data: mockPageData,
                isLoading: false, isFetched: true,
                error: null,
            } as any)

            renderPage()

            await waitFor(() => {
                const editor = screen.getByTestId('rich-text-editor')
                expect(editor).toBeDisabled()
            })
        })
    })
})
