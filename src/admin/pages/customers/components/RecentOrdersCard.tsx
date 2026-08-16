import {PackageOpen, ShoppingCart} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import {RecentOrdersTable} from '@/admin/components/RecentOrdersTable'
import type {AdminOrderRef} from '@/admin/pages/customers/types'
import {WholesaleApplicationDetailHeader} from './WholesaleApplicationDetailHeader.tsx'

interface RecentOrdersCardProps {
    orders: AdminOrderRef[]
}

/** Card chrome around the shared RecentOrdersTable, matching this page's other section cards. */
export function RecentOrdersCard({orders}: RecentOrdersCardProps) {
    return (
        <Card as="section" elevation="none" padded={false}>
            <WholesaleApplicationDetailHeader icon={ShoppingCart} title="Recent Orders"/>
            <Card.Body className="p-5">
                <RecentOrdersTable
                    orders={orders}
                    emptyState={
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <PackageOpen className="h-8 w-8 text-(--c-text-muted)"/>
                            <p className="text-sm font-medium text-(--c-text)">No orders yet</p>
                            <p className="text-sm text-(--c-text-muted)">
                                Orders placed by this customer will appear here.
                            </p>
                        </div>
                    }
                />
            </Card.Body>
        </Card>
    )
}
