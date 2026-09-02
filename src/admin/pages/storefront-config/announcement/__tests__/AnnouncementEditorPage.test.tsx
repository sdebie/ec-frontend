import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {AnnouncementEditorPage} from '../AnnouncementEditorPage'

const mockRequest = vi.fn()

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
    adminGraphqlClient: {
        request: (...args: unknown[]) => mockRequest(...args),
    },
}))

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    })
}

const defaultSettings = {
    storeSettings: [
        {
            key: 'storefront.header',
            value: JSON.stringify({
                announcement: {
                    enabled: false,
                    text: '',
                    backgroundColor: '#1a1f35',
                    textColor: '#ffffff',
                },
            }),
            description: 'Storefront header config',
        },
    ],
}

function renderPage(settingsResponse = defaultSettings) {
    mockRequest.mockResolvedValueOnce(settingsResponse)
    const queryClient = createQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <AnnouncementEditorPage/>
        </QueryClientProvider>,
    )
}

describe('AnnouncementEditorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('live preview updates with unsaved values (Requirement 7.4)', () => {
        it('updates preview text when typing in the text input', async () => {
            const user = userEvent.setup()
            renderPage()

            // Wait for loading to finish
            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            const textInput = screen.getByLabelText('Announcement Text')
            await user.type(textInput, 'Free shipping today!')

            // Preview should show the typed text immediately (unsaved)
            expect(screen.getByText('Free shipping today!')).toBeInTheDocument()
        })

        it('updates preview background colour when picker changes', async () => {
            const user = userEvent.setup()
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            // The preview only renders the real banner once there's something to
            // show — give it a message first.
            await user.type(screen.getByLabelText('Announcement Text'), 'Sale!')

            const bgColorInput = document.getElementById('bg-color') as HTMLInputElement
            expect(bgColorInput).not.toBeNull()

            // Simulate color change via fireEvent (color inputs don't work well with userEvent)
            const {fireEvent} = await import('@testing-library/react')
            fireEvent.input(bgColorInput, {target: {value: '#ff0000'}})

            const banner = screen.getByText('Sale!').closest('[role="banner"]')
            expect(banner).toHaveStyle({backgroundColor: '#ff0000'})
        })

        it('updates preview text colour when picker changes', async () => {
            const user = userEvent.setup()
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            await user.type(screen.getByLabelText('Announcement Text'), 'Sale!')

            const textColorInput = document.getElementById('text-color') as HTMLInputElement
            expect(textColorInput).not.toBeNull()

            const {fireEvent} = await import('@testing-library/react')
            fireEvent.input(textColorInput, {target: {value: '#00ff00'}})

            const banner = screen.getByText('Sale!').closest('[role="banner"]')
            expect(banner).toHaveStyle({color: '#00ff00'})
        })

        it('shows a placeholder instead of the real banner when there is nothing to preview', async () => {
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByText(/nothing to preview yet/i)).toBeInTheDocument()
            expect(screen.queryByText('Sale!')).not.toBeInTheDocument()
        })
    })

    describe('preview mirrors the real storefront AnnouncementBanner', () => {
        const settingsWithRealData = {
            storeSettings: [
                {
                    key: 'storefront.header',
                    value: JSON.stringify({
                        announcement: {
                            enabled: false,
                            text: '',
                            backgroundColor: '#7a0019',
                            textColor: '#ffffff',
                            showContact: true,
                            showSocial: true,
                        },
                    }),
                    description: 'Storefront header config',
                },
                {
                    key: 'storefront.contact',
                    value: JSON.stringify({phones: ['+27 11 123 4567'], whatsapp: '+27821234567'}),
                    description: 'Contact config',
                },
                {
                    key: 'storefront.footer',
                    value: JSON.stringify({
                        socialLinks: [
                            {id: 'sl-facebook', label: 'Facebook', icon: 'facebook', path: 'https://facebook.com/uvh', external: true},
                        ],
                    }),
                    description: 'Footer config',
                },
            ],
        }

        it('renders real contact info from Contact settings, not just the toggle state', async () => {
            renderPage(settingsWithRealData)

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByText('+27 11 123 4567')).toBeInTheDocument()
            expect(screen.getByText('WhatsApp')).toBeInTheDocument()
        })

        it("renders real social links from the footer, remapping the raw setting's path to a usable href", async () => {
            renderPage(settingsWithRealData)

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            const facebookLink = screen.getByLabelText('Facebook')
            expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/uvh')
        })

        it('shows the draft preview even while Enabled is off', async () => {
            renderPage(settingsWithRealData)

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByRole('switch', {name: 'Enabled'})).toHaveAttribute('aria-checked', 'false')
            expect(screen.getByText('+27 11 123 4567')).toBeInTheDocument()
        })
    })

    describe('PageLayout adoption', () => {
        it('renders the title via PageLayout and no back button', async () => {
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByRole('heading', {name: 'Announcement Banner'})).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /back/i})).not.toBeInTheDocument()
        })
    })

    describe('standardized Card layout (matching Quote Detail)', () => {
        it('renders Preview, Content and Display Options as separate labeled cards', async () => {
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByText('Preview')).toBeInTheDocument()
            expect(screen.getByText('Content')).toBeInTheDocument()
            expect(screen.getByText('Display Options')).toBeInTheDocument()
        })
    })

    describe('showContact / showSocial round-trip (admin parity with the storefront banner)', () => {
        const settingsWithSlots = {
            storeSettings: [
                {
                    key: 'storefront.header',
                    value: JSON.stringify({
                        announcement: {
                            enabled: true,
                            text: '',
                            backgroundColor: '#7a0019',
                            textColor: '#ffffff',
                            showContact: true,
                            showSocial: true,
                        },
                    }),
                    description: 'Storefront header config',
                },
            ],
        }

        it('preserves showContact and showSocial on save when only an unrelated field changes', async () => {
            const user = userEvent.setup()
            mockRequest.mockResolvedValueOnce(settingsWithSlots)
            mockRequest.mockResolvedValueOnce({
                updateSetting: {key: 'storefront.header', value: '{}', description: null},
            })
            mockRequest.mockResolvedValueOnce(settingsWithSlots)

            const queryClient = createQueryClient()
            render(
                <QueryClientProvider client={queryClient}>
                    <AnnouncementEditorPage/>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            // Touch only the text field — showContact/showSocial were never
            // interacted with, so a correct implementation carries the loaded
            // values through untouched.
            const textInput = screen.getByLabelText('Announcement Text')
            await user.type(textInput, ' Sale!')

            const saveButton = screen.getByRole('button', {name: /save changes/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2)
            })

            const mutationVariables = mockRequest.mock.calls[1][1] as { key: string; value: string }
            const parsedValue = JSON.parse(mutationVariables.value)
            expect(parsedValue.announcement.showContact).toBe(true)
            expect(parsedValue.announcement.showSocial).toBe(true)
        })

        it('renders the toggles reflecting already-saved showContact/showSocial values', async () => {
            renderPage(settingsWithSlots)

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByRole('switch', {name: 'Show Contact Info'})).toHaveAttribute('aria-checked', 'true')
            expect(screen.getByRole('switch', {name: 'Show Social Icons'})).toHaveAttribute('aria-checked', 'true')
        })

        it('defaults both toggles off when the stored config predates them', async () => {
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            expect(screen.getByRole('switch', {name: 'Show Contact Info'})).toHaveAttribute('aria-checked', 'false')
            expect(screen.getByRole('switch', {name: 'Show Social Icons'})).toHaveAttribute('aria-checked', 'false')
        })

        it('turning a toggle on from the UI is what actually saves as true', async () => {
            const user = userEvent.setup()
            renderPage() // both flags start false/unset

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            await user.click(screen.getByRole('switch', {name: 'Show Contact Info'}))

            mockRequest.mockResolvedValueOnce({
                updateSetting: {key: 'storefront.header', value: '{}', description: null},
            })

            await user.click(screen.getByRole('button', {name: /save changes/i}))

            await waitFor(() => {
                expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2)
            })

            const mutationVariables = mockRequest.mock.calls[1][1] as { key: string; value: string }
            const parsedValue = JSON.parse(mutationVariables.value)
            expect(parsedValue.announcement.showContact).toBe(true)
            expect(parsedValue.announcement.showSocial).toBe(false)
        })
    })

    describe('save calls updateSetting with correct key and JSON (Requirement 7.1)', () => {
        it('calls updateSetting with storefront.header key and announcement JSON on save', async () => {
            const user = userEvent.setup()
            // Initial query fetch
            mockRequest.mockResolvedValueOnce(defaultSettings)
            // Mutation response
            mockRequest.mockResolvedValueOnce({
                updateSetting: {
                    key: 'storefront.header',
                    value: '{}',
                    description: null,
                },
            })
            // Refetch after invalidation
            mockRequest.mockResolvedValueOnce(defaultSettings)

            const queryClient = createQueryClient()
            render(
                <QueryClientProvider client={queryClient}>
                    <AnnouncementEditorPage/>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            // Toggle enabled on
            const toggle = screen.getByRole('switch', {name: 'Enabled'})
            await user.click(toggle)

            const textInput = screen.getByLabelText('Announcement Text')
            await user.type(textInput, 'Big sale!')

            // Click save
            const saveButton = screen.getByRole('button', {name: /save changes/i})
            await user.click(saveButton)

            // Wait for the mutation call to happen (at least 2 calls: initial query + mutation)
            await waitFor(() => {
                expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2)
            })

            const mutationCall = mockRequest.mock.calls[1]
            const mutationVariables = mutationCall[1] as { key: string; value: string }

            expect(mutationVariables.key).toBe('storefront.header')

            const parsedValue = JSON.parse(mutationVariables.value)
            expect(parsedValue).toEqual({
                announcement: {
                    enabled: true,
                    text: 'Big sale!',
                    backgroundColor: '#1a1f35',
                    textColor: '#ffffff',
                    showContact: false,
                    showSocial: false,
                },
            })
        })
    })

    describe('fields remain editable when toggle is off (Requirement 7.5)', () => {
        it('text input is editable when toggle is disabled', async () => {
            const user = userEvent.setup()
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            // Toggle should be off (default state)
            const toggle = screen.getByRole('switch', {name: 'Enabled'})
            expect(toggle).toHaveAttribute('aria-checked', 'false')

            // Text input should still be editable
            const textInput = screen.getByLabelText('Announcement Text')
            await user.type(textInput, 'Draft message')
            expect(textInput).toHaveValue('Draft message')
        })

        it('colour pickers are editable when toggle is disabled', async () => {
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            // Toggle should be off
            const toggle = screen.getByRole('switch', {name: 'Enabled'})
            expect(toggle).toHaveAttribute('aria-checked', 'false')

            // Background colour picker should be editable
            const bgColorInput = document.getElementById('bg-color') as HTMLInputElement
            expect(bgColorInput).not.toBeDisabled()

            // Text colour picker should be editable
            const textColorInput = document.getElementById('text-color') as HTMLInputElement
            expect(textColorInput).not.toBeDisabled()

            // Change values
            const {fireEvent} = await import('@testing-library/react')
            fireEvent.input(bgColorInput, {target: {value: '#333333'}})
            fireEvent.input(textColorInput, {target: {value: '#eeeeee'}})

            expect(bgColorInput.value).toBe('#333333')
            expect(textColorInput.value).toBe('#eeeeee')
        })

        it('save button is available when toggle is off', async () => {
            renderPage()

            await waitFor(() => {
                expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
            })

            const toggle = screen.getByRole('switch', {name: 'Enabled'})
            expect(toggle).toHaveAttribute('aria-checked', 'false')

            const saveButton = screen.getByRole('button', {name: /save changes/i})
            expect(saveButton).not.toBeDisabled()
        })
    })
})
