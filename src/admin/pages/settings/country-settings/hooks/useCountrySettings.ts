import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {CountrySetting} from '../types'

const COUNTRY_SETTINGS = gql`
    query CountrySettings {
        countrySettings {
            countryCode
            countryName
            currencyCode
            locale
            decimalPlaces
            isDefault: default
            isActive: active
        }
    }
`

interface CountrySettingsResponse {
    countrySettings: CountrySetting[]
}

export function useCountrySettings() {
    return useQuery({
        queryKey: ['admin-country-settings'],
        queryFn: () => adminGraphqlClient.request<CountrySettingsResponse>(COUNTRY_SETTINGS),
        select: (data) => data.countrySettings,
    })
}
