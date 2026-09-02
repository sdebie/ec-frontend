import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {AddressDto} from '@/shared/types/AddressDto'
import type {WholesaleApplicationStatus} from '@/shared/types/enums'

const WHOLESALE_APPLICATION_DETAIL = gql`
    query WholesaleApplicationDetail($id: String!) {
        wholesaleApplication(id: $id) {
            id
            status
            firstName
            lastName
            email
            phone
            applicantEmail
            companyName
            companyEmail
            companyPhone
            tradingName
            vatNumber
            regNumber
            notes
            customerId
            financeContactName
            financeContactEmail
            financeContactPhone
            purchaseOrderRequired
            physicalAddress {
                line1
                line2
                suburb
                city
                province
                postalCode
            }
            postalAddress {
                line1
                line2
                suburb
                city
                province
                postalCode
            }
            createdAt
            processedAt
            rejectionReason
        }
    }
`

export interface WholesaleApplicationDetail {
    id: string
    status: WholesaleApplicationStatus
    firstName: string
    lastName: string
    email: string
    phone: string | null
    applicantEmail: string
    companyName: string
    companyEmail: string | null
    companyPhone: string | null
    tradingName: string | null
    vatNumber: string | null
    regNumber: string | null
    notes: string | null
    customerId: string | null
    financeContactName: string | null
    financeContactEmail: string | null
    financeContactPhone: string | null
    purchaseOrderRequired: boolean | null
    physicalAddress: AddressDto | null
    postalAddress: AddressDto | null
    createdAt: string
    processedAt: string | null
    rejectionReason: string | null
}

interface WholesaleApplicationDetailResponse {
    wholesaleApplication: WholesaleApplicationDetail | null
}

export function useWholesaleApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: ['admin', 'wholesale-application', applicationId],
        queryFn: () =>
            adminGraphqlClient.request<WholesaleApplicationDetailResponse>(
                WHOLESALE_APPLICATION_DETAIL,
                {id: applicationId},
            ),
        enabled: !!applicationId,
        select: (data) => data.wholesaleApplication,
    })
}
