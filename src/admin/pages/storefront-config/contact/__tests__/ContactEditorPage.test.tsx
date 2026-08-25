import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ContactEditorPage} from '../ContactEditorPage'
import {useStoreSettings} from '@/admin/hooks/settings/useStoreSettings'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

const mockMutate = vi.fn()

vi.mock('@/admin/hooks/settings/useStoreSettings', () => ({
    useStoreSettings: vi.fn(),
}))

vi.mock('@/admin/hooks/settings/useUpdateSetting', () => ({
    useUpdateSetting: vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
}))

vi.mock('@/shared/auth/adminAuthStore', () => ({
    useAdminAuthStore: vi.fn(),
}))

vi.mock('@/admin/context/BreadcrumbContext', () => ({
    useBreadcrumb: vi.fn(),
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

// --- Test Data ---
const contactConfig = {
    enquiryEmail: 'enquiries@store.co.za',
    emails: ['info@store.co.za', 'support@store.co.za'],
    phones: ['+27123456789'],
    landline: '+27219876543',
    whatsapp: '+27827654321',
    physicalAddress: '123 Main Street\nCape Town\n8001',
    businessHours: 'Mon-Fri 08:00-17:00',
    responseSla: 'We respond within 24 hours',
    mapUrl: 'https://www.google.com/maps/place/Cape+Town',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=abc123',
}

const mockSettings = [
    {
        key: 'storefront.contact',
        value: JSON.stringify(contactConfig),
        description: null,
    },
]

// --- Helpers ---
function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    })
}

function setupMocks({role = 'SUPER_ADMIN', settings = mockSettings}: {
    role?: string;
    settings?: typeof mockSettings
} = {}) {
    vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
        selector({role}),
    )
    vi.mocked(useStoreSettings).mockReturnValue({
        data: settings,
        isLoading: false,
    } as any)
}

function renderPage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <ContactEditorPage/>
        </QueryClientProvider>,
    )
}

function getTabButton(name: string) {
    return screen.getByRole('tab', {name})
}

function settingsWithEmails(emails: string[]) {
    return [
        {
            key: 'storefront.contact',
            value: JSON.stringify({...contactConfig, emails, phones: []}),
            description: null,
        },
    ]
}

// --- Tests ---
describe('ContactEditorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('editor loads existing values', () => {
        it('shows loaded emails and phones as editable table rows', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })
            expect(screen.getByDisplayValue('support@store.co.za')).toBeInTheDocument()
            expect(screen.getByDisplayValue('+27123456789')).toBeInTheDocument()
        })

        it('shows General-tab fields immediately, since General is the default tab', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('+27219876543')).toBeInTheDocument()
            })
            expect(screen.getByDisplayValue('+27827654321')).toBeInTheDocument()
        })

        it('shows Location-tab fields once the Location tab is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            await user.click(getTabButton('Location'))

            // getByDisplayValue's default matcher collapses whitespace (so a
            // literal \n query never matches a real newline in the value) —
            // pass an identity normalizer to compare the raw multi-line value.
            expect(
                screen.getByDisplayValue('123 Main Street\nCape Town\n8001', {normalizer: (s) => s}),
            ).toBeInTheDocument()
        })

        it('shows Hours & Response tab fields once that tab is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            await user.click(getTabButton('Hours & Response'))

            expect(screen.getByDisplayValue('Mon-Fri 08:00-17:00')).toBeInTheDocument()
            expect(screen.getByDisplayValue('We respond within 24 hours')).toBeInTheDocument()
        })

        it('shows Maps tab fields once the Maps tab is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            await user.click(getTabButton('Maps'))

            expect(screen.getByDisplayValue('https://www.google.com/maps/place/Cape+Town')).toBeInTheDocument()
            expect(screen.getByDisplayValue('https://www.google.com/maps/embed?pb=abc123')).toBeInTheDocument()
        })
    })

    describe('only the active tab is exposed to assistive tech', () => {
        it('hides non-active tab panels (native hidden attribute) and shows only the active one', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            const generalPanel = screen.getByText('General', {selector: 'h4'}).closest('[role="tabpanel"]')
            const locationPanel = screen.getByText('Location', {selector: 'h4'}).closest('[role="tabpanel"]')

            expect(generalPanel).toBeVisible()
            expect(locationPanel).not.toBeVisible()
            expect(getTabButton('General')).toHaveAttribute('aria-selected', 'true')
            expect(getTabButton('Location')).toHaveAttribute('aria-selected', 'false')

            await user.click(getTabButton('Location'))

            expect(generalPanel).not.toBeVisible()
            expect(locationPanel).toBeVisible()
            expect(getTabButton('General')).toHaveAttribute('aria-selected', 'false')
            expect(getTabButton('Location')).toHaveAttribute('aria-selected', 'true')
        })
    })

    describe('email/phone table editing', () => {
        it('renders existing values directly in editable inputs (no separate edit action needed)', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            expect(screen.queryByRole('button', {name: /edit email/i})).not.toBeInTheDocument()
        })

        it('typing into an existing row updates that input directly', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            const input = screen.getByDisplayValue('info@store.co.za')
            await user.clear(input)
            await user.type(input, 'updated@store.co.za')

            expect(input).toHaveValue('updated@store.co.za')
        })

        it('opens a newly added email immediately, ready for typing', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', {name: 'Add email'}))

            const newRowInput = screen.getByRole('textbox', {name: 'Email Addresses 3'})
            expect(newRowInput).toBeInTheDocument()
            await user.type(newRowInput, 'third@store.co.za')
            expect(newRowInput).toHaveValue('third@store.co.za')
        })

        it('removes an email via the remove action on its row', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('support@store.co.za')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', {name: 'Remove email addresses 2'}))

            expect(screen.queryByDisplayValue('support@store.co.za')).not.toBeInTheDocument()
            expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
        })

        it('shows table column headers for Email Address and Actions', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            expect(screen.getByRole('columnheader', {name: 'Email Address'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Phone Number'})).toBeInTheDocument()
            // Both tables have their own Actions column.
            expect(screen.getAllByRole('columnheader', {name: 'Actions'})).toHaveLength(2)
        })
    })

    describe('email/phone table pagination', () => {
        it('shows at most 3 rows per page, with next/prev paging through the rest', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: settingsWithEmails(['a@store.co.za', 'b@store.co.za', 'c@store.co.za', 'd@store.co.za']),
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('a@store.co.za')).toBeInTheDocument()
            })

            // Page 1: only the first 3.
            expect(screen.getByDisplayValue('a@store.co.za')).toBeInTheDocument()
            expect(screen.getByDisplayValue('b@store.co.za')).toBeInTheDocument()
            expect(screen.getByDisplayValue('c@store.co.za')).toBeInTheDocument()
            expect(screen.queryByDisplayValue('d@store.co.za')).not.toBeInTheDocument()
            expect(screen.getByText('1–3 of 4')).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'Next page of email addresses'}))

            // Page 2: just the 4th.
            expect(screen.queryByDisplayValue('a@store.co.za')).not.toBeInTheDocument()
            expect(screen.getByDisplayValue('d@store.co.za')).toBeInTheDocument()
            expect(screen.getByText('4–4 of 4')).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'Previous page of email addresses'}))

            expect(screen.getByDisplayValue('a@store.co.za')).toBeInTheDocument()
        })

        it('shows no pagination controls when 3 or fewer entries exist', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            expect(screen.queryByRole('button', {name: /next page of email addresses/i})).not.toBeInTheDocument()
        })

        it('jumps to the page containing a newly added row when adding past a full page', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: settingsWithEmails(['a@store.co.za', 'b@store.co.za', 'c@store.co.za']),
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('a@store.co.za')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', {name: 'Add email'}))

            expect(screen.getByRole('textbox', {name: 'Email Addresses 4'})).toBeInTheDocument()
            expect(screen.queryByDisplayValue('a@store.co.za')).not.toBeInTheDocument()
        })
    })

    describe('save sends the correct key and stringified value', () => {
        it('calls mutate with key storefront.contact and JSON.stringify of the config', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({emails: ['test@example.com'], phones: ['+27000000']}),
                        description: null,
                    },
                ],
            })
            renderPage()

            // Wait for the form to load with values
            await waitFor(() => {
                expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
            })

            // Submit the form
            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const callArgs = mockMutate.mock.calls[0]
            expect(callArgs[0]).toEqual({
                key: 'storefront.contact',
                value: JSON.stringify({emails: ['test@example.com'], phones: ['+27000000']}),
            })
        })
    })

    describe('invalid email prevents save', () => {
        it('does not call mutate when an email field contains an invalid email', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({emails: ['not-an-email'], phones: []}),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('not-an-email')).toBeInTheDocument()
            })

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(screen.getByText('Invalid email address')).toBeInTheDocument()
            })

            expect(mockMutate).not.toHaveBeenCalled()
        })
    })

    describe('invalid mapEmbedUrl prevents save', () => {
        it('does not call mutate when mapEmbedUrl is not an approved embed URL', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({emails: [], phones: []}),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

            await user.click(getTabButton('Maps'))

            // Type an invalid embed URL
            const mapEmbedInput = screen.getByPlaceholderText('https://www.google.com/maps/embed?pb=...')
            await user.type(mapEmbedInput, 'https://evil.com/embed')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(screen.getByText('Must be an approved map embed URL (Google Maps or OpenStreetMap)')).toBeInTheDocument()
            })

            expect(mockMutate).not.toHaveBeenCalled()
        })
    })

    describe('VIEWER sees disabled fields and no mutation controls', () => {
        it('renders every input as disabled when role is VIEWER, including email/phone table rows', async () => {
            setupMocks({role: 'VIEWER'})
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('+27219876543')).toBeInTheDocument()
            })

            const inputs = screen.getAllByRole('textbox')
            expect(inputs.length).toBeGreaterThan(0)
            inputs.forEach((input) => {
                expect(input).toBeDisabled()
            })
        })

        it('shows no add/remove controls for VIEWER', async () => {
            setupMocks({role: 'VIEWER'})
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            expect(screen.queryByRole('button', {name: 'Add email'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Add phone'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /remove email addresses/i})).not.toBeInTheDocument()
            expect(screen.queryByRole('columnheader', {name: 'Actions'})).not.toBeInTheDocument()
        })
    })

    describe('VIEWER does not see Save button', () => {
        it('does not render a Save button when role is VIEWER', async () => {
            setupMocks({role: 'VIEWER'})
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('+27219876543')).toBeInTheDocument()
            })

            expect(screen.queryByRole('button', {name: /save/i})).not.toBeInTheDocument()
        })
    })

    // --- Enquiry Email field tests (Req 5.1, 5.2, 5.3) ---

    describe('enquiryEmail field renders with existing value', () => {
        it('shows the enquiryEmail from settings in the Enquiry Form panel', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
            })

            expect(screen.getByText('Enquiry Form')).toBeInTheDocument()
            expect(screen.getByText('Enquiry recipient email')).toBeInTheDocument()
        })
    })

    describe('enquiryEmail is included in the save payload', () => {
        it('persists enquiryEmail in the JSON when saving', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({
                            enquiryEmail: 'old@store.co.za',
                            emails: ['info@store.co.za'],
                            phones: ['+27000000'],
                        }),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('old@store.co.za')).toBeInTheDocument()
            })

            // Clear and type new enquiry email
            const enquiryInput = screen.getByDisplayValue('old@store.co.za')
            await user.clear(enquiryInput)
            await user.type(enquiryInput, 'new@store.co.za')

            // Submit
            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const callArgs = mockMutate.mock.calls[0]
            expect(callArgs[0].key).toBe('storefront.contact')
            const parsed = JSON.parse(callArgs[0].value)
            expect(parsed.enquiryEmail).toBe('new@store.co.za')
        })
    })

    describe('VIEWER: enquiryEmail field is disabled', () => {
        it('renders enquiryEmail input as disabled for VIEWER role', async () => {
            setupMocks({role: 'VIEWER'})
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
            })

            const enquiryInput = screen.getByDisplayValue('enquiries@store.co.za')
            expect(enquiryInput).toBeDisabled()
        })
    })

    describe('enquiryEmail validation rejects malformed email', () => {
        it('does not submit when enquiryEmail is a malformed email address', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({enquiryEmail: '', emails: [], phones: []}),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

            // Type an invalid email in the enquiry field
            const enquiryInput = screen.getByPlaceholderText('e.g. info@store.co.za')
            await user.type(enquiryInput, 'not-a-valid-email')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(screen.getByText('Must be a valid email address or empty to disable')).toBeInTheDocument()
            })

            expect(mockMutate).not.toHaveBeenCalled()
        })
    })

    describe('enquiryEmail allows empty value', () => {
        it('submits successfully when enquiryEmail is empty (disables the enquiry form)', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({
                            enquiryEmail: 'old@store.co.za',
                            emails: ['info@store.co.za'],
                            phones: ['+27000000'],
                        }),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('old@store.co.za')).toBeInTheDocument()
            })

            // Clear the enquiry email to make it empty
            const enquiryInput = screen.getByDisplayValue('old@store.co.za')
            await user.clear(enquiryInput)

            // Submit
            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            // enquiryEmail should not be in the persisted config (empty is omitted by formToContactConfig)
            const callArgs = mockMutate.mock.calls[0]
            const parsed = JSON.parse(callArgs[0].value)
            expect(parsed.enquiryEmail).toBeUndefined()
        })
    })

    // --- WhatsApp field tests (contacteditorpage-drops-whatsapp-on-save) ---

    describe('whatsapp survives save', () => {
        it('preserves whatsapp when only an unrelated field is touched and saved', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({
                            emails: ['info@store.co.za'],
                            phones: ['+27000000'],
                            whatsapp: '+27827654321',
                            landline: '+27219876543',
                        }),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            })

            // Touch only an unrelated field, on a different tab — whatsapp was
            // never interacted with, so a correct implementation carries the
            // loaded value through untouched.
            await user.click(getTabButton('Hours & Response'))
            const businessHoursInput = screen.getByPlaceholderText('e.g. Mon-Fri 08:00-17:00, Sat 09:00-13:00')
            await user.type(businessHoursInput, 'Mon-Fri 09:00-17:00')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const callArgs = mockMutate.mock.calls[0]
            const parsed = JSON.parse(callArgs[0].value)
            expect(parsed.whatsapp).toBe('+27827654321')
        })
    })

    describe('whatsapp field accepts and saves a new value', () => {
        it('renders a WhatsApp input and saves a newly typed value', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {
                        key: 'storefront.contact',
                        value: JSON.stringify({emails: [], phones: []}),
                        description: null,
                    },
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

            // WhatsApp lives on the General tab, which is active by default.
            const whatsappInput = screen.getByLabelText('WhatsApp')
            await user.type(whatsappInput, '+27760000000')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const callArgs = mockMutate.mock.calls[0]
            const parsed = JSON.parse(callArgs[0].value)
            expect(parsed.whatsapp).toBe('+27760000000')
        })
    })
})
