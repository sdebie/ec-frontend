import {useQuery} from '@tanstack/react-query'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {
    ADMIN_CUSTOMER_DETAIL_QUERY,
    type AdminCustomerDetailRawApplication,
} from '@/admin/pages/customers/hooks/adminCustomerDetailQuery'
import type {WholesaleApplication, WholesaleCustomerDetail} from '../../types'
import type {WholesaleOrderRef} from '../types'

interface AdminCustomerRawResponse {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    status: string
    shopperType: string
    registeredAt: string
    wholesaleApplication: AdminCustomerDetailRawApplication | null
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
            adminGraphqlClient.request<AdminCustomerResponse>(ADMIN_CUSTOMER_DETAIL_QUERY, {id: customerId}),
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
