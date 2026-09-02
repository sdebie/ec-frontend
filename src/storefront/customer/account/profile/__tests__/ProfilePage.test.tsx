import {beforeEach, describe, expect, it, vi} from 'vitest'
import fc from 'fast-check'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {AddressDto} from '@/shared/types/AddressDto'
import type {StorefrontMeResponse} from '../../types'
import {useCustomerProfile} from '../../hooks/useCustomerProfile'
import {useUpdateProfile} from '../../hooks/useUpdateProfile'
import {useChangePassword} from '../../hooks/useChangePassword'
import {ProfilePage} from '../ProfilePage'

vi.mock('../../hooks/useCustomerProfile')
vi.mock('../../hooks/useUpdateProfile')
vi.mock('../../hooks/useChangePassword')

const mockedUseCustomerProfile = vi.mocked(useCustomerProfile)
const mockedUseUpdateProfile = vi.mocked(useUpdateProfile)
const mockedUseChangePassword = vi.mocked(useChangePassword)

/** Arbitrary for a non-empty string (trimmed, at least 1 char) */
const nonEmptyStringArb = fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0)

/** Arbitrary for a valid phone number */
const phoneArb = fc.constantFrom(
    '+27 82 123 4567',
    '0821234567',
    '+1-555-123-4567',
    '(012) 345 6789',
    '+44 7700 900000',
)

const addressDtoArb: fc.Arbitrary<AddressDto> = fc.record({
    line1: nonEmptyStringArb,
    line2: fc.option(nonEmptyStringArb, {nil: null}),
    suburb: fc.option(nonEmptyStringArb, {nil: null}),
    city: nonEmptyStringArb,
    province: nonEmptyStringArb,
    postalCode: fc.stringMatching(/^[0-9]{4,6}$/),
})

/** Arbitrary for a valid StorefrontMeResponse with address fields populated */
const profileWithAddressArb: fc.Arbitrary<StorefrontMeResponse> = fc.record({
    email: fc.emailAddress(),
    shopperType: fc.constantFrom('GUEST' as const, 'RETAILER' as const, 'WHOLESALER' as const),
    firstName: nonEmptyStringArb,
    lastName: nonEmptyStringArb,
    phone: fc.oneof(phoneArb, fc.constant(null)),
    physicalAddress: fc.oneof(addressDtoArb, fc.constant(null)),
    postalAddress: fc.oneof(addressDtoArb, fc.constant(null)),
    hasPassword: fc.boolean(),
})

/** Arbitrary for profile with guaranteed physical address (for same-as-physical tests) */
const profileWithPhysicalAddressArb: fc.Arbitrary<StorefrontMeResponse> = fc.record({
    email: fc.emailAddress(),
    shopperType: fc.constantFrom('GUEST' as const, 'RETAILER' as const, 'WHOLESALER' as const),
    firstName: nonEmptyStringArb,
    lastName: nonEmptyStringArb,
    phone: fc.oneof(phoneArb, fc.constant(null)),
    physicalAddress: addressDtoArb,
    postalAddress: fc.constant(null),
    hasPassword: fc.boolean(),
})

function setupMocks(profile: StorefrontMeResponse) {
    mockedUseCustomerProfile.mockReturnValue({
        data: profile,
        isLoading: false,
    } as ReturnType<typeof useCustomerProfile>)

    mockedUseUpdateProfile.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        reset: vi.fn(),
    } as unknown as ReturnType<typeof useUpdateProfile>)

    mockedUseChangePassword.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        reset: vi.fn(),
    } as unknown as ReturnType<typeof useChangePassword>)
}

function renderProfilePage() {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <ProfilePage/>
            </MemoryRouter>
        </QueryClientProvider>,
    )
}

describe('ProfilePage — property-based tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    /**
     * Property 7: Profile form pre-population
     *
     * For any valid StorefrontMeResponse with firstName, lastName, phone, and address fields,
     * the rendered profile form should have each corresponding input pre-populated with that value.
     */
    describe('Property 7: Profile form pre-population', () => {
        it('pre-populates firstName, lastName, and phone fields from profile data', () => {
            fc.assert(
                fc.property(profileWithAddressArb, (profile) => {
                    setupMocks(profile)
                    const {unmount} = renderProfilePage()

                    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement
                    const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement
                    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement

                    expect(firstNameInput.value).toBe(profile.firstName)
                    expect(lastNameInput.value).toBe(profile.lastName)
                    expect(phoneInput.value).toBe(profile.phone ?? '')

                    unmount()
                }),
                {numRuns: 50},
            )
        })

        it('pre-populates physical address fields from profile data', () => {
            fc.assert(
                fc.property(profileWithPhysicalAddressArb, (profile) => {
                    setupMocks(profile)
                    const {unmount} = renderProfilePage()

                    const physicalAddress = profile.physicalAddress!

                    const line1 = document.getElementById('physicalLine1') as HTMLInputElement
                    const line2 = document.getElementById('physicalLine2') as HTMLInputElement
                    const suburb = document.getElementById('physicalSuburb') as HTMLInputElement
                    const city = document.getElementById('physicalCity') as HTMLInputElement
                    const province = document.getElementById('physicalProvince') as HTMLInputElement
                    const postalCode = document.getElementById('physicalPostalCode') as HTMLInputElement

                    expect(line1.value).toBe(physicalAddress.line1)
                    expect(line2.value).toBe(physicalAddress.line2 ?? '')
                    expect(suburb.value).toBe(physicalAddress.suburb ?? '')
                    expect(city.value).toBe(physicalAddress.city)
                    expect(province.value).toBe(physicalAddress.province)
                    expect(postalCode.value).toBe(physicalAddress.postalCode)

                    unmount()
                }),
                {numRuns: 50},
            )
        })

        it('pre-populates postal address fields from profile data', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        email: fc.emailAddress(),
                        shopperType: fc.constantFrom('GUEST' as const, 'RETAILER' as const, 'WHOLESALER' as const),
                        firstName: nonEmptyStringArb,
                        lastName: nonEmptyStringArb,
                        phone: fc.oneof(phoneArb, fc.constant(null)),
                        physicalAddress: addressDtoArb,
                        postalAddress: addressDtoArb,
                        hasPassword: fc.boolean(),
                    }),
                    (profile) => {
                        setupMocks(profile)
                        const {unmount} = renderProfilePage()

                        const postalAddress = profile.postalAddress!

                        const line1 = document.getElementById('postalLine1') as HTMLInputElement
                        const line2 = document.getElementById('postalLine2') as HTMLInputElement
                        const suburb = document.getElementById('postalSuburb') as HTMLInputElement
                        const city = document.getElementById('postalCity') as HTMLInputElement
                        const province = document.getElementById('postalProvince') as HTMLInputElement
                        const postalCode = document.getElementById('postalPostalCode') as HTMLInputElement

                        expect(line1.value).toBe(postalAddress.line1)
                        expect(line2.value).toBe(postalAddress.line2 ?? '')
                        expect(suburb.value).toBe(postalAddress.suburb ?? '')
                        expect(city.value).toBe(postalAddress.city)
                        expect(province.value).toBe(postalAddress.province)
                        expect(postalCode.value).toBe(postalAddress.postalCode)

                        unmount()
                    },
                ),
                {numRuns: 50},
            )
        })

        it('displays email as read-only from profile', () => {
            fc.assert(
                fc.property(profileWithAddressArb, (profile) => {
                    setupMocks(profile)
                    const {unmount} = renderProfilePage()

                    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
                    expect(emailInput.value).toBe(profile.email)
                    expect(emailInput.readOnly).toBe(true)

                    unmount()
                }),
                {numRuns: 20},
            )
        })
    })

    /**
     * Property 8: Postal address same-as-physical copies all fields
     *
     * For any physical address (line1, line2, suburb, city, province, postalCode),
     * checking the "Postal address same as physical" checkbox should result in all postal
     * fields matching the physical fields and being disabled.
     */
    describe('Property 8: Postal address same-as-physical copies all fields', () => {
        it('copies all physical address fields to postal fields when checkbox is checked', () => {
            fc.assert(
                fc.property(profileWithPhysicalAddressArb, (profile) => {
                    setupMocks(profile)
                    const {unmount} = renderProfilePage()

                    const physicalAddress = profile.physicalAddress!

                    // Click the "Postal address same as physical" checkbox
                    const checkbox = document.getElementById('postalSameAsPhysical') as HTMLInputElement
                    fireEvent.click(checkbox)

                    // Verify postal fields now match physical fields
                    const postalLine1 = document.getElementById('postalLine1') as HTMLInputElement
                    const postalLine2 = document.getElementById('postalLine2') as HTMLInputElement
                    const postalSuburb = document.getElementById('postalSuburb') as HTMLInputElement
                    const postalCity = document.getElementById('postalCity') as HTMLInputElement
                    const postalProvince = document.getElementById('postalProvince') as HTMLInputElement
                    const postalPostalCode = document.getElementById('postalPostalCode') as HTMLInputElement

                    expect(postalLine1.value).toBe(physicalAddress.line1)
                    expect(postalLine2.value).toBe(physicalAddress.line2 ?? '')
                    expect(postalSuburb.value).toBe(physicalAddress.suburb ?? '')
                    expect(postalCity.value).toBe(physicalAddress.city)
                    expect(postalProvince.value).toBe(physicalAddress.province)
                    expect(postalPostalCode.value).toBe(physicalAddress.postalCode)

                    unmount()
                }),
                {numRuns: 50},
            )
        })

        it('disables all postal fields when checkbox is checked', () => {
            fc.assert(
                fc.property(profileWithPhysicalAddressArb, (profile) => {
                    setupMocks(profile)
                    const {unmount} = renderProfilePage()

                    // Click the "Postal address same as physical" checkbox
                    const checkbox = document.getElementById('postalSameAsPhysical') as HTMLInputElement
                    fireEvent.click(checkbox)

                    // Verify all postal fields are disabled
                    const postalLine1 = document.getElementById('postalLine1') as HTMLInputElement
                    const postalLine2 = document.getElementById('postalLine2') as HTMLInputElement
                    const postalSuburb = document.getElementById('postalSuburb') as HTMLInputElement
                    const postalCity = document.getElementById('postalCity') as HTMLInputElement
                    const postalProvince = document.getElementById('postalProvince') as HTMLInputElement
                    const postalPostalCode = document.getElementById('postalPostalCode') as HTMLInputElement

                    expect(postalLine1.disabled).toBe(true)
                    expect(postalLine2.disabled).toBe(true)
                    expect(postalSuburb.disabled).toBe(true)
                    expect(postalCity.disabled).toBe(true)
                    expect(postalProvince.disabled).toBe(true)
                    expect(postalPostalCode.disabled).toBe(true)

                    unmount()
                }),
                {numRuns: 50},
            )
        })
    })

    /**
     * Property 9: Password mismatch validation
     *
     * For any two non-equal strings entered as "new password" and "confirm password",
     * the form should display a validation error and not make any network request.
     */
    describe('Property 9: Password mismatch validation', () => {
        it('displays validation error and does not call mutation when passwords do not match', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc
                        .record({
                            newPassword: fc.string({minLength: 8, maxLength: 30}),
                            confirmPassword: fc.string({minLength: 1, maxLength: 30}),
                        })
                        .filter(({newPassword, confirmPassword}) => newPassword !== confirmPassword),
                    async ({newPassword, confirmPassword}) => {
                        const profile: StorefrontMeResponse = {
                            email: 'test@example.com',
                            shopperType: 'RETAILER',
                            firstName: 'Test',
                            lastName: 'User',
                            phone: null,
                            physicalAddress: null,
                            postalAddress: null,
                            hasPassword: true,
                        }

                        const mutateFn = vi.fn()
                        mockedUseCustomerProfile.mockReturnValue({
                            data: profile,
                            isLoading: false,
                        } as ReturnType<typeof useCustomerProfile>)
                        mockedUseUpdateProfile.mockReturnValue({
                            mutate: vi.fn(),
                            isPending: false,
                            isError: false,
                            reset: vi.fn(),
                        } as unknown as ReturnType<typeof useUpdateProfile>)
                        mockedUseChangePassword.mockReturnValue({
                            mutate: mutateFn,
                            isPending: false,
                            isError: false,
                            reset: vi.fn(),
                        } as unknown as ReturnType<typeof useChangePassword>)

                        const {unmount} = renderProfilePage()

                        // Fill in the password fields using fireEvent.change to handle arbitrary strings
                        const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement
                        const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement
                        const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement

                        fireEvent.change(currentPasswordInput, {target: {value: 'OldPassword1'}})
                        fireEvent.change(newPasswordInput, {target: {value: newPassword}})
                        fireEvent.change(confirmPasswordInput, {target: {value: confirmPassword}})

                        // Submit the password form
                        const passwordForm = confirmPasswordInput.closest('form')!
                        fireEvent.submit(passwordForm)

                        // Wait for validation error to appear
                        await waitFor(() => {
                            expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
                        })

                        // Assert no network request was made
                        expect(mutateFn).not.toHaveBeenCalled()

                        unmount()
                    },
                ),
                {numRuns: 20},
            )
        })
    })

    /**
     * Property 10: Short password validation
     *
     * For any string with length fewer than 8 characters entered as the new password,
     * the form should display a validation error and not make any network request.
     */
    describe('Property 10: Short password validation', () => {
        it('displays validation error and does not call mutation when password is too short', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({minLength: 1, maxLength: 7}),
                    async (shortPassword) => {
                        const profile: StorefrontMeResponse = {
                            email: 'test@example.com',
                            shopperType: 'RETAILER',
                            firstName: 'Test',
                            lastName: 'User',
                            phone: null,
                            physicalAddress: null,
                            postalAddress: null,
                            hasPassword: true,
                        }

                        const mutateFn = vi.fn()
                        mockedUseCustomerProfile.mockReturnValue({
                            data: profile,
                            isLoading: false,
                        } as ReturnType<typeof useCustomerProfile>)
                        mockedUseUpdateProfile.mockReturnValue({
                            mutate: vi.fn(),
                            isPending: false,
                            isError: false,
                            reset: vi.fn(),
                        } as unknown as ReturnType<typeof useUpdateProfile>)
                        mockedUseChangePassword.mockReturnValue({
                            mutate: mutateFn,
                            isPending: false,
                            isError: false,
                            reset: vi.fn(),
                        } as unknown as ReturnType<typeof useChangePassword>)

                        const {unmount} = renderProfilePage()

                        // Fill in the password fields using fireEvent.change to handle arbitrary strings
                        const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement
                        const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement
                        const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement

                        fireEvent.change(currentPasswordInput, {target: {value: 'OldPassword1'}})
                        fireEvent.change(newPasswordInput, {target: {value: shortPassword}})
                        fireEvent.change(confirmPasswordInput, {target: {value: shortPassword}})

                        // Submit the password form
                        const passwordForm = confirmPasswordInput.closest('form')!
                        fireEvent.submit(passwordForm)

                        // Wait for validation error to appear
                        await waitFor(() => {
                            expect(
                                screen.getByText('Password must be at least 8 characters'),
                            ).toBeInTheDocument()
                        })

                        // Assert no network request was made
                        expect(mutateFn).not.toHaveBeenCalled()

                        unmount()
                    },
                ),
                {numRuns: 20},
            )
        })
    })
})
