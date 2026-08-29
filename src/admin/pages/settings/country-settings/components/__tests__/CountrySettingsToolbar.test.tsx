import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {CountrySettingsToolbar} from '../CountrySettingsToolbar'

describe('CountrySettingsToolbar', () => {
    it('renders the search input with the current value', () => {
        render(
            <CountrySettingsToolbar
                searchValue="south"
                onSearchChange={vi.fn()}
            />,
        )

        expect(screen.getByPlaceholderText('Search countries...')).toHaveValue('south')
    })

    it('calls onSearchChange when the search box changes', () => {
        const onSearchChange = vi.fn()
        render(
            <CountrySettingsToolbar
                searchValue=""
                onSearchChange={onSearchChange}
            />,
        )

        fireEvent.change(screen.getByPlaceholderText('Search countries...'), {
            target: {value: 'south'},
        })

        expect(onSearchChange).toHaveBeenCalledWith('south')
    })
})
