import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {WholesaleApplication, WholesaleCustomerDetail} from '../../types'
import type {WholesaleOrderRef} from '../types'

const ADMIN_CUSTOMER = gql`
    query AdminCustomer($id: String!) {
        adminCustomer(id: $id) {
            id
            firstName
            lastName
            email
            phone
            status
            shopperType
            registeredAt
            wholesaleApplication {
                id
                status
                companyName
                vatNumber
                regNumber
                email
                firstName
                lastName
                createdAt
                applicantEmail
                tradingName
                companyPhone
                companyEmail
                financeContactName
                financeContactEmail
                financeContactPhone
                purchaseOrderRequired
            }
            recentOrders {
                id
                reference
                placedAt
                total
                status
            }
        }
    }
`

interface AdminCustomerRawApplication {
    id: string
    status: string
    companyName: string
    vatNumber: string | null
    regNumber: string | null
    email: string
    firstName: string
    lastName: string
    createdAt: string
    applicantEmail: string
    tradingName: string | null
    companyPhone: string | null
    companyEmail: string | null
    financeContactName: string | null
    financeContactEmail: string | null
    financeContactPhone: string | null
    purchaseOrderRequired: boolean | null
}

interface AdminCustomerRawResponse {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    status: string
    shopperType: string
    registeredAt: string
    wholesaleApplication: AdminCustomerRawApplication | null
    recentOrders: WholesaleOrderRef[]
}

interface AdminCustomerResponse {
    adminCustomer: AdminCustomerRawResponse | null
}

function mapToWholesaleCustomerDetail(raw: AdminCustomerRawResponse): WholesaleCustomerDetail {
    let wholesaleApplication: WholesaleApplication | null = null

    if (raw.wholesaleApplication) {
        const app = raw.wholesaleApplication
        wholesaleApplication = {
            id: app.id,
            companyName: app.companyName,
            vatNumber: app.vatNumber,
            regNumber: app.regNumber,
            status: app.status as WholesaleApplication['status'],
            submittedAt: app.createdAt,
            applicantEmail: app.applicantEmail,
            accountEmail: app.email || null,
            tradingName: app.tradingName,
            companyPhone: app.companyPhone,
            companyEmail: app.companyEmail,
            financeContactName: app.financeContactName,
            financeContactEmail: app.financeContactEmail,
            financeContactPhone: app.financeContactPhone,
            purchaseOrderRequired: app.purchaseOrderRequired,
        }
    }

    return {
        id: raw.id,
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        phone: raw.phone,
        status: raw.status as WholesaleCustomerDetail['status'],
        registeredAt: raw.registeredAt,
        wholesaleApplication,
        recentOrders: raw.recentOrders,
    }
}

export function useWholesaleCustomerDetail(customerId: string) {
    const {data, isLoading, error} = useQuery({
        queryKey: ['admin', 'customers', 'wholesale-detail', customerId],
        queryFn: () =>
            adminGraphqlClient.request<AdminCustomerResponse>(ADMIN_CUSTOMER, {id: customerId}),
        enabled: !!customerId,
    })

    const customer = data?.adminCustomer
        ? mapToWholesaleCustomerDetail(data.adminCustomer)
        : undefined

    return {
        data: customer,
        isLoading,
        error,
    }
}
