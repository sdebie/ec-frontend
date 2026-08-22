import {useState} from 'react'
import {CalendarDays, Package, Wallet} from 'lucide-react'
import {useNavigate, useParams} from 'react-router-dom'
import {PageLayout, FormPageNotFound, OrderStatusDisplay, PageLoadingSpinner} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import {useOrderDetail} from './hooks/useOrderDetail'
import {useUpdateOrderStatus} from './hooks/useUpdateOrderStatus'
import {useOrderStatusConfirmation} from './hooks/useOrderStatusConfirmation'
import type {ConfirmedAction} from './utils/confirmedActions'
import {OrderCustomerCard} from './components/OrderCustomerCard'
import {OrderLineItemsTable} from './components/OrderLineItemsTable'
import {OrderStatTile} from './components/OrderStatTile'
import {OrderStatusConfirmationDialog} from './components/OrderStatusConfirmationDialog'
import {OrderPaymentPanel} from './components/OrderPaymentPanel'
import {OrderStatusHistory} from './components/OrderStatusHistory'
import {OrderSummaryPanel} from './components/OrderSummaryPanel'
import {OrderActionsPanel} from './components/OrderActionsPanel'
import {ShipOrderDialog} from './components/ShipOrderDialog'

export function OrderDetailPage() {
    const navigate = useNavigate()
    const {orderId} = useParams<{ orderId: string }>()
    const {data, isLoading} = useOrderDetail(orderId!)
    const canMutate = useCan('order:write')
    const updateStatus = useUpdateOrderStatus()

    const confirmation = useOrderStatusConfirmation()
    const [shipOpen, setShipOpen] = useState(false)

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (!data) {
        return <FormPageNotFound entityName="Order" backHref="/admin/orders" backLabel="Back to orders"/>
    }

    const order = data

    const handleConfirmAction = () => {
        updateStatus.mutate(confirmation.buildPayload(), {onSettled: confirmation.close})
    }

    const handleShip = (tracking: { trackingNumber?: string; trackingCarrier?: string }) => {
        updateStatus.mutate(
            {orderId: order.id, status: OrderStatus.IN_TRANSIT, ...tracking},
            {onSettled: () => setShipOpen(false)},
        )
    }

    return (
        <PageLayout title="Order Details" onBack={() => navigate(-1)}>
            <div className="flex flex-col gap-6">
                <Card as="article" variant="panel">
                    <Card.Body className="flex flex-col gap-6 p-5">
                        <Card as="section" variant="bordered">
                            <Card.Header className="m-0 px-5 py-4">
                                Order Information
                            </Card.Header>
                            <Card.Body className="flex flex-col gap-6 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <h2 className="font-mono text-xl font-semibold uppercase text-(--c-text)">
                                        #{order.reference}
                                    </h2>
                                    <OrderStatusDisplay status={order.status}/>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <OrderStatTile
                                        label="Order Date"
                                        value={formatDateTime(order.placedAt)}
                                        icon={CalendarDays}
                                    />
                                    <OrderStatTile
                                        label="Total Items"
                                        value={`${order.itemCount} items`}
                                        icon={Package}
                                    />
                                    <OrderStatTile
                                        label="Order Total"
                                        value={formatAmount(order.grandTotal)}
                                        icon={Wallet}
                                    />
                                </div>

                                {/* Lines and money side by side on a wide screen, stacked on a narrow one. */}
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                                    <div className="min-w-0">
                                        <OrderLineItemsTable lineItems={order.lineItems}/>
                                    </div>

                                    <div className="space-y-4">
                                        <OrderSummaryPanel
                                            subtotal={order.subtotal}
                                            shippingCost={order.shippingCost}
                                            vatAmount={order.vatAmount}
                                            grandTotal={order.grandTotal}
                                        />
                                        {order.latestPayment && (
                                            <OrderPaymentPanel payment={order.latestPayment}/>
                                        )}
                                        {canMutate && (
                                            <OrderActionsPanel
                                                status={order.status}
                                                onConfirm={(action: ConfirmedAction) =>
                                                    confirmation.ask(action, order.id, order.status)
                                                }
                                                onShip={() => setShipOpen(true)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        <OrderCustomerCard
                            customerName={order.customerName}
                            customerEmail={order.customerEmail}
                            shippingAddress={order.shippingAddress}
                            trackingNumber={order.trackingNumber}
                            trackingCarrier={order.trackingCarrier}
                        />

                        <Card as="section" variant="bordered">
                            <Card.Header className="m-0 px-5 py-4">Order Tracking</Card.Header>
                            <Card.Body className="p-5">
                                <OrderStatusHistory history={order.statusHistory}/>
                            </Card.Body>
                        </Card>
                    </Card.Body>
                </Card>

                <OrderStatusConfirmationDialog
                    state={confirmation.state}
                    onConfirm={handleConfirmAction}
                    onClose={confirmation.close}
                    isLoading={updateStatus.isPending}
                />

                <ShipOrderDialog
                    open={shipOpen}
                    onClose={() => setShipOpen(false)}
                    onConfirm={handleShip}
                    isLoading={updateStatus.isPending}
                />
            </div>
        </PageLayout>
    )
}
