import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import type {CountrySetting} from '../../types'
import {CountrySettingsTable} from '../CountrySettingsTable'

const southAfrica: CountrySetting = {
    countryCode: 'ZA',
    countryName: 'South Africa',
    currencyCode: 'ZAR',
    locale: 'en-ZA',
    decimalPlaces: 2,
    isDefault: true,
    isActive: true,
}
const unitedStates: CountrySetting = {
    countryCode: 'US',
    countryName: 'United States',
    currencyCode: 'USD',
    locale: 'en-US',
    decimalPlaces: 2,
    isDefault: false,
    isActive: false,
}

describe('CountrySettingsTable', () => {
    it('renders column headers: Country, Code, Currency, Locale, Decimals, Default', () => {
        render(<CountrySettingsTable data={[southAfrica]} isLoading={false}/>)

        expect(screen.getByRole('columnheader', {name: 'Country'})).toBeInTheDocument()
        expect(screen.getByRole('columnheader', {name: 'Code'})).toBeInTheDocument()
        expect(screen.getByRole('columnheader', {name: 'Currency'})).toBeInTheDocument()
        expect(screen.getByRole('columnheader', {name: 'Locale'})).toBeInTheDocument()
        expect(screen.getByRole('columnheader', {name: 'Decimals'})).toBeInTheDocument()
        expect(screen.getByRole('columnheader', {name: 'Default'})).toBeInTheDocument()
    })

    it('renders country data', () => {
        render(<CountrySettingsTable data={[southAfrica, unitedStates]} isLoading={false}/>)

        expect(screen.getByText('South Africa')).toBeInTheDocument()
        expect(screen.getByText('ZAR')).toBeInTheDocument()
        expect(screen.getByText('en-ZA')).toBeInTheDocument()
        expect(screen.getByText('United States')).toBeInTheDocument()
    })

    it('shows a Default badge only for the default country', () => {
        render(<CountrySettingsTable data={[southAfrica, unitedStates]} isLoading={false}/>)

        // 'Default' appears once as the column header and once as the ZA row's badge
        expect(screen.getAllByText('Default')).toHaveLength(2)
    })

    it('applies opacity-50 to an inactive country row, not an active one', () => {
        render(<CountrySettingsTable data={[southAfrica, unitedStates]} isLoading={false}/>)

        expect(screen.getByText('South Africa')).not.toHaveClass('opacity-50')
        expect(screen.getByText('United States')).toHaveClass('opacity-50')
    })

    it('shows the empty message when there is no data', () => {
        render(<CountrySettingsTable data={[]} isLoading={false}/>)

        expect(screen.getByText('No countries found')).toBeInTheDocument()
    })
})
