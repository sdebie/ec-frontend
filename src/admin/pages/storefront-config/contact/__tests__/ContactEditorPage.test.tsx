import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ContactEditorPage} from '../ContactEditorPage'
import {useStoreSettings} from '@/admin/hooks/settings/useStoreSettings'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

const mockMutate = vi.fn()

vi.mock('@/admin/hooks/settings/useStoreSettings', () => ({
    useStoreSettings: vi.fn(),
}))

vi.mock('@/admin/hooks/settings/useSaveStoreSettings', () => ({
    useSaveStoreSettings: vi.fn(() => ({
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

vi.mock('@/shared/ui/components/toast', () => ({
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

const footerConfig = {
    description: 'A great store',
    footerCallout: {heading: 'Sale', body: '20% off everything'},
    // The raw setting keys the URL `path`, not `to` — `to` is only the public
    // shape the backend remaps this into for the storefront to read.
    socialLinks: [
        {id: 'sl-1', label: 'Facebook', path: 'https://facebook.com/store', icon: 'facebook', external: true},
    ],
}

const mockSettings = [
    {key: 'storefront.contact', value: JSON.stringify(contactConfig), description: null},
    {key: 'storefront.footer', value: JSON.stringify(footerConfig), description: null},
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

/**
 * aria-hidden elements compute an empty accessible name by spec, so neither
 * {hidden: true, name} nor a heading-text lookup can find an inactive panel.
 * aria-controls on the tab button points at the panel's real id regardless of
 * its hidden state, so resolve it that way instead.
 */
function getTabPanel(name: string) {
    const panelId = getTabButton(name).getAttribute('aria-controls')
    return document.getElementById(panelId!)
}

async function goTo(user: ReturnType<typeof userEvent.setup>, name: string) {
    await user.click(getTabButton(name))
}

function settingsWithEmails(emails: string[]) {
    return [
        {key: 'storefront.contact', value: JSON.stringify({...contactConfig, emails, phones: []}), description: null},
        {key: 'storefront.footer', value: JSON.stringify(footerConfig), description: null},
    ]
}

// --- Tests ---
describe('ContactEditorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Enquiry Form is the default section', () => {
        it('shows the Enquiry Form fields immediately, with its nav item selected', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
            })
            expect(getTabButton('Enquiry Form')).toHaveAttribute('aria-selected', 'true')
            expect(getTabButton('Email Addresses')).toHaveAttribute('aria-selected', 'false')
        })
    })

    describe('editor loads existing values once each section is selected', () => {
        it('shows Email Addresses fields once that section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Email Addresses')

            expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
            expect(screen.getByDisplayValue('support@store.co.za')).toBeInTheDocument()
        })

        it('shows Phone Numbers fields, including Landline above the table, once that section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Phone Numbers')

            expect(screen.getByDisplayValue('+27123456789')).toBeInTheDocument()
            expect(screen.getByDisplayValue('+27219876543')).toBeInTheDocument()
        })

        it('shows Location fields once that section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Location')

            // getByDisplayValue's default matcher collapses whitespace (so a
            // literal \n query never matches a real newline in the value) —
            // pass an identity normalizer to compare the raw multi-line value.
            expect(
                screen.getByDisplayValue('123 Main Street\nCape Town\n8001', {normalizer: (s) => s}),
            ).toBeInTheDocument()
        })

        it('shows Hours & Response fields once that section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Hours & Response')

            expect(screen.getByDisplayValue('Mon-Fri 08:00-17:00')).toBeInTheDocument()
            expect(screen.getByDisplayValue('We respond within 24 hours')).toBeInTheDocument()
        })

        it('shows Maps fields once that section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Maps')

            expect(screen.getByDisplayValue('https://www.google.com/maps/place/Cape+Town')).toBeInTheDocument()
            expect(screen.getByDisplayValue('https://www.google.com/maps/embed?pb=abc123')).toBeInTheDocument()
        })

        it('shows Social fields, including WhatsApp above the table, once that section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Social')

            expect(screen.getByDisplayValue('Facebook')).toBeInTheDocument()
            expect(screen.getByDisplayValue('https://facebook.com/store')).toBeInTheDocument()
            expect(screen.getByDisplayValue('+27827654321')).toBeInTheDocument()
        })
    })

    describe('only the active section is exposed to assistive tech', () => {
        it('hides non-active panels (native hidden attribute) and shows only the active one', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            const enquiryPanel = getTabPanel('Enquiry Form')
            const locationPanel = getTabPanel('Location')

            expect(enquiryPanel).toBeVisible()
            expect(locationPanel).not.toBeVisible()
            expect(getTabButton('Enquiry Form')).toHaveAttribute('aria-selected', 'true')
            expect(getTabButton('Location')).toHaveAttribute('aria-selected', 'false')

            await goTo(user, 'Location')

            expect(enquiryPanel).not.toBeVisible()
            expect(locationPanel).toBeVisible()
            expect(getTabButton('Enquiry Form')).toHaveAttribute('aria-selected', 'false')
            expect(getTabButton('Location')).toHaveAttribute('aria-selected', 'true')
        })
    })

    describe('nav count badges', () => {
        it('shows a count badge for Email Addresses, Phone Numbers and Social matching their entry counts', async () => {
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            expect(within(getTabButton('Email Addresses')).getByText('2')).toBeInTheDocument()
            expect(within(getTabButton('Phone Numbers')).getByText('1')).toBeInTheDocument()
            expect(within(getTabButton('Social')).getByText('1')).toBeInTheDocument()
        })

        it('shows no badge for a section with zero entries', async () => {
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({...contactConfig, phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            expect(within(getTabButton('Phone Numbers')).queryByText('0')).not.toBeInTheDocument()
            expect(within(getTabButton('Social')).queryByText('0')).not.toBeInTheDocument()
        })
    })

    describe('email/phone table editing', () => {
        it('renders existing values directly in editable inputs (no separate edit action needed)', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Email Addresses')

            expect(screen.queryByRole('button', {name: /edit email/i})).not.toBeInTheDocument()
        })

        it('typing into an existing row updates that input directly', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            const input = screen.getByDisplayValue('info@store.co.za')
            await user.clear(input)
            await user.type(input, 'updated@store.co.za')

            expect(input).toHaveValue('updated@store.co.za')
        })

        it('opens a newly added email immediately, ready for typing', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

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
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            await user.click(screen.getByRole('button', {name: 'Remove email addresses 2'}))

            expect(screen.queryByDisplayValue('support@store.co.za')).not.toBeInTheDocument()
            expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
        })

        it('shows table column headers for Email Address and Actions', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            expect(screen.getByRole('columnheader', {name: 'Email Address'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Actions'})).toBeInTheDocument()
        })

        it('shows Phone Number and Actions column headers once the Phone Numbers section is selected', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Phone Numbers')

            expect(screen.getByRole('columnheader', {name: 'Phone Number'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Actions'})).toBeInTheDocument()
            expect(screen.getByDisplayValue('+27123456789')).toBeInTheDocument()
        })
    })

    describe('email/phone table pagination', () => {
        it('shows at most 3 rows per page, with next/prev paging through the rest', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: settingsWithEmails(['a@store.co.za', 'b@store.co.za', 'c@store.co.za', 'd@store.co.za']),
            })
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

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
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            expect(screen.queryByRole('button', {name: /next page of email addresses/i})).not.toBeInTheDocument()
        })

        it('jumps to the page containing a newly added row when adding past a full page', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: settingsWithEmails(['a@store.co.za', 'b@store.co.za', 'c@store.co.za']),
            })
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            await user.click(screen.getByRole('button', {name: 'Add email'}))

            expect(screen.getByRole('textbox', {name: 'Email Addresses 4'})).toBeInTheDocument()
            expect(screen.queryByDisplayValue('a@store.co.za')).not.toBeInTheDocument()
        })
    })

    describe('Maps preview', () => {
        it('shows the live preview iframe for an approved, non-empty map embed URL', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await goTo(user, 'Maps')

            expect(screen.getByTitle('Map preview')).toHaveAttribute('src', contactConfig.mapEmbedUrl)
        })

        it('shows a placeholder instead of a preview when the embed URL is empty', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: [], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()
            await waitFor(() => expect(screen.getByText('Contact Settings')).toBeInTheDocument())

            await goTo(user, 'Maps')

            expect(screen.queryByTitle('Map preview')).not.toBeInTheDocument()
            expect(screen.getByText('Enter an approved map embed URL to see a preview.')).toBeInTheDocument()
        })

        it('drops the preview once the embed URL is edited to an unapproved value', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Maps')

            const embedInput = screen.getByDisplayValue(contactConfig.mapEmbedUrl)
            await user.clear(embedInput)
            await user.type(embedInput, 'https://evil.com/embed')

            expect(screen.queryByTitle('Map preview')).not.toBeInTheDocument()
        })
    })

    describe('Social section', () => {
        it('shows an empty state when there are no social links', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: [], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()
            await waitFor(() => expect(screen.getByText('Contact Settings')).toBeInTheDocument())

            await goTo(user, 'Social')

            expect(screen.getByText('No social links configured.')).toBeInTheDocument()
        })

        it('adds a new social link row, ready to fill in', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: [], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()
            await waitFor(() => expect(screen.getByText('Contact Settings')).toBeInTheDocument())
            await goTo(user, 'Social')

            await user.click(screen.getByRole('button', {name: 'Add social link'}))

            const labelInput = screen.getByRole('textbox', {name: 'Social link 1 label'})
            await user.type(labelInput, 'Instagram')
            expect(labelInput).toHaveValue('Instagram')
        })

        it('removes a social link via the remove action on its row', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Social')

            await user.click(screen.getByRole('button', {name: 'Remove social link 1'}))

            expect(screen.queryByDisplayValue('Facebook')).not.toBeInTheDocument()
            expect(screen.getByText('No social links configured.')).toBeInTheDocument()
        })

        it('does not save when a social link has an invalid URL', async () => {
            const user = userEvent.setup()
            setupMocks()
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Social')

            const urlInput = screen.getByDisplayValue('https://facebook.com/store')
            await user.clear(urlInput)
            await user.type(urlInput, 'not-a-url')

            await user.click(screen.getByRole('button', {name: /save/i}))

            // The Maps section's mapUrl field carries the identical string as
            // static helper text and stays mounted (just hidden) while Social is
            // active, so scope the search to the Social panel to disambiguate.
            const socialPanel = getTabPanel('Social')!
            await waitFor(() => {
                expect(within(socialPanel).getByText('Must be a valid HTTPS URL')).toBeInTheDocument()
            })
            expect(mockMutate).not.toHaveBeenCalled()
        })
    })

    describe('save sends both storefront.contact and storefront.footer in one call', () => {
        it('calls mutate with an array containing both settings keys, correctly stringified', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: ['test@example.com'], phones: ['+27000000']}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({description: 'Kept as-is'}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', {name: /save/i}))

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const [settingsToSave] = mockMutate.mock.calls[0]
            const contactEntry = settingsToSave.find((s: {key: string}) => s.key === 'storefront.contact')
            const footerEntry = settingsToSave.find((s: {key: string}) => s.key === 'storefront.footer')

            expect(JSON.parse(contactEntry.value)).toEqual({emails: ['test@example.com'], phones: ['+27000000']})
            expect(JSON.parse(footerEntry.value).description).toBe('Kept as-is')
        })

        it('shows a "Saved" confirmation on success', async () => {
            const {toast} = await import('@/shared/ui/components/toast')
            const user = userEvent.setup()
            setupMocks()
            mockMutate.mockImplementation((_settings, {onSuccess}: {onSuccess: () => void}) => onSuccess())
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())

            await user.click(screen.getByRole('button', {name: /save/i}))

            expect(toast.success).toHaveBeenCalledWith('Saved')
        })
    })

    describe('invalid email prevents save', () => {
        it('does not call mutate when an email field contains an invalid email', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: ['not-an-email'], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()
            await waitFor(() => expect(screen.getByText('Contact Settings')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            await waitFor(() => expect(screen.getByDisplayValue('not-an-email')).toBeInTheDocument())

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
                    {key: 'storefront.contact', value: JSON.stringify({emails: [], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

            await goTo(user, 'Maps')

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
            const user = userEvent.setup()
            setupMocks({role: 'VIEWER'})
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            const inputs = screen.getAllByRole('textbox')
            expect(inputs.length).toBeGreaterThan(0)
            inputs.forEach((input) => {
                expect(input).toBeDisabled()
            })
        })

        it('shows no add/remove controls for VIEWER', async () => {
            const user = userEvent.setup()
            setupMocks({role: 'VIEWER'})
            renderPage()
            await waitFor(() => expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument())
            await goTo(user, 'Email Addresses')

            expect(screen.queryByRole('button', {name: 'Add email'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /remove email addresses/i})).not.toBeInTheDocument()
            expect(screen.queryByRole('columnheader', {name: 'Actions'})).not.toBeInTheDocument()

            await goTo(user, 'Social')
            expect(screen.queryByRole('button', {name: 'Add social link'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /remove social link/i})).not.toBeInTheDocument()
        })
    })

    describe('VIEWER does not see Save button', () => {
        it('does not render a Save button when role is VIEWER', async () => {
            setupMocks({role: 'VIEWER'})
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
            })

            expect(screen.queryByRole('button', {name: /save/i})).not.toBeInTheDocument()
        })
    })

    // --- Enquiry Email field tests ---

    describe('enquiryEmail field renders with existing value', () => {
        it('shows the enquiryEmail from settings on the Enquiry Form section', async () => {
            setupMocks()
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
            })

            // "Enquiry Form" also appears as the nav item's own label — scope to
            // the heading role to target the section content specifically.
            expect(screen.getByRole('heading', {name: 'Enquiry Form'})).toBeInTheDocument()
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
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('old@store.co.za')).toBeInTheDocument()
            })

            const enquiryInput = screen.getByDisplayValue('old@store.co.za')
            await user.clear(enquiryInput)
            await user.type(enquiryInput, 'new@store.co.za')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const [settingsToSave] = mockMutate.mock.calls[0]
            const contactEntry = settingsToSave.find((s: {key: string}) => s.key === 'storefront.contact')
            expect(JSON.parse(contactEntry.value).enquiryEmail).toBe('new@store.co.za')
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
                    {key: 'storefront.contact', value: JSON.stringify({enquiryEmail: '', emails: [], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

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
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByDisplayValue('old@store.co.za')).toBeInTheDocument()
            })

            const enquiryInput = screen.getByDisplayValue('old@store.co.za')
            await user.clear(enquiryInput)

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const [settingsToSave] = mockMutate.mock.calls[0]
            const contactEntry = settingsToSave.find((s: {key: string}) => s.key === 'storefront.contact')
            expect(JSON.parse(contactEntry.value).enquiryEmail).toBeUndefined()
        })
    })

    // --- WhatsApp field tests (Social section, above the social links table) ---

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
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => expect(screen.getByText('Contact Settings')).toBeInTheDocument())

            // Touch only an unrelated field, on a different section — whatsapp
            // was never interacted with, so a correct implementation carries the
            // loaded value through untouched.
            await goTo(user, 'Hours & Response')
            const businessHoursInput = screen.getByPlaceholderText('e.g. Mon-Fri 08:00-17:00, Sat 09:00-13:00')
            await user.type(businessHoursInput, 'Mon-Fri 09:00-17:00')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const [settingsToSave] = mockMutate.mock.calls[0]
            const contactEntry = settingsToSave.find((s: {key: string}) => s.key === 'storefront.contact')
            expect(JSON.parse(contactEntry.value).whatsapp).toBe('+27827654321')
        })
    })

    describe('whatsapp field accepts and saves a new value', () => {
        it('renders a WhatsApp input on Social and saves a newly typed value', async () => {
            const user = userEvent.setup()
            setupMocks({
                settings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: [], phones: []}), description: null},
                    {key: 'storefront.footer', value: JSON.stringify({}), description: null},
                ],
            })
            renderPage()

            await waitFor(() => {
                expect(screen.getByText('Contact Settings')).toBeInTheDocument()
            })

            await goTo(user, 'Social')
            const whatsappInput = screen.getByLabelText('WhatsApp')
            await user.type(whatsappInput, '+27760000000')

            const saveButton = screen.getByRole('button', {name: /save/i})
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1)
            })

            const [settingsToSave] = mockMutate.mock.calls[0]
            const contactEntry = settingsToSave.find((s: {key: string}) => s.key === 'storefront.contact')
            expect(JSON.parse(contactEntry.value).whatsapp).toBe('+27760000000')
        })
    })
})
