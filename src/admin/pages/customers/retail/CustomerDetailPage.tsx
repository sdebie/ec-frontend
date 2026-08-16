import {useParams} from 'react-router-dom'
import {FormPageLayout, FormPageNotFound, PageLoadingSpinner} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useCustomerDetail} from './hooks/useCustomerDetail'
import {CustomerIdentityPanel} from '../components/CustomerIdentityPanel'
import {WholesaleAccountPanel} from '../components/WholesaleAccountPanel'
import {RecentOrdersCard} from '../components/RecentOrdersCard'

export function CustomerDetailPage() {
    const {customerId} = useParams<{ customerId: string }>()
    const {data, isLoading} = useCustomerDetail(customerId!)

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (!data) {
        return (
            <FormPageNotFound
                entityName="Customer"
                backHref="/admin/customers"
                backLabel="Back to customers"
            />
        )
    }

    const customer = data

    return (
        <FormPageLayout title="Customer Details">
            <div className="flex flex-col gap-6">
                <Card as="article" elevation="sm" padded={false}>
                    <Card.Body className="flex flex-col gap-6 p-5">
                        <CustomerIdentityPanel
                            customer={customer}
                            shopperType={customer.shopperType}
                            permissionCapability="customer:write"
                        />
                        <WholesaleAccountPanel
                            customer={customer}
                        />
                    </Card.Body>
                </Card>

                <RecentOrdersCard orders={customer.recentOrders}/>
            </div>
        </FormPageLayout>
    )
}
