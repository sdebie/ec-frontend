import {useNavigate, useParams} from 'react-router-dom'
import {PageLayout, FormPageNotFound, PageLoadingSpinner} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useWholesaleCustomerDetail} from './hooks/useWholesaleCustomerDetail'
import {CustomerIdentityPanel} from '../components/CustomerIdentityPanel'
import {WholesaleAccountPanel} from '../components/WholesaleAccountPanel'
import {RecentOrdersCard} from '../components/RecentOrdersCard'

export function WholesaleCustomerDetailPage() {
    const navigate = useNavigate()
    const {customerId} = useParams<{ customerId: string }>()
    const {data, isLoading} = useWholesaleCustomerDetail(customerId!)

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (!data) {
        return (
            <FormPageNotFound
                entityName="Customer"
                backHref="/admin/wholesale/customers"
                backLabel="Back to wholesale customers"
            />
        )
    }

    const customer = data

    return (
        <PageLayout title="Customer Details" onBack={() => navigate(-1)}>
            <div className="flex flex-col gap-6">
                <Card as="article" variant="panel">
                    <Card.Body className="flex flex-col gap-6 p-5">
                        <CustomerIdentityPanel customer={customer}/>
                        <WholesaleAccountPanel customer={customer}/>
                    </Card.Body>
                </Card>

                <RecentOrdersCard orders={customer.recentOrders}/>
            </div>
        </PageLayout>
    )
}
