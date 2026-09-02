import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {FormPageNotFound, OrderStatusDisplay, PageLayout, PageLoadingSpinner} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {formatDisplayDate} from '@/shared/utils/formatDateTime'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import {useOrderDetail} from './hooks/useOrderDetail'
import {useUpdateOrderStatus} from './hooks/useUpdateOrderStatus'
import {useOrderStatusConfirmation} from './hooks/useOrderStatusConfirmation'
import type {ConfirmedAction} from './utils/confirmedActions'
import {getOrderTrackingSteps} from './utils/orderTrackingSteps'
import {OrderTrackingStepper} from './components/OrderTrackingStepper'
import {OrderLineItemsTable} from './components/OrderLineItemsTable'
import {OrderStatusConfirmationDialog} from './components/OrderStatusConfirmationDialog'
import {OrderPaymentPanel} from './components/OrderPaymentPanel'
import {OrderStatusHistory} from './components/OrderStatusHistory'
import {OrderSummaryPanel} from './components/OrderSummaryPanel'
import {OrderCustomerPanel} from './components/OrderCustomerPanel'
import {OrderShippingAddressPanel} from './components/OrderShippingAddressPanel'
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
    const trackingSteps = getOrderTrackingSteps(order)

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
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-mono text-xl font-semibold uppercase text-(--c-text)">
                            #{order.reference}
                        </h2>
                        <p className="mt-1 text-sm text-(--c-text-muted)">
                            Placed {formatDisplayDate(order.placedAt)}
                        </p>
                    </div>
                    <OrderStatusDisplay status={order.status}/>
                </div>

                <Card as="section" variant="bordered">
                    <Card.Body className="px-5 py-4">
                        <OrderTrackingStepper steps={trackingSteps}/>
                    </Card.Body>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <Card as="section" variant="bordered" className="min-w-0">
                        <Card.Header className="m-0 px-5 py-4">
                            Items · {order.lineItems.length}
                        </Card.Header>
                        <Card.Body className="p-5">
                            <OrderLineItemsTable lineItems={order.lineItems}/>
                        </Card.Body>
                    </Card>

                    <div className="space-y-4">
                        <OrderCustomerPanel
                            customerName={order.customerName}
                            customerEmail={order.customerEmail}
                        />

                        <Card as="section" variant="bordered">
                            <Card.Header className="m-0 px-5 py-4">
                                Order Summary
                            </Card.Header>
                            <Card.Body className="p-5">
                                <OrderSummaryPanel
                                    subtotal={order.subtotal}
                                    shippingCost={order.shippingCost}
                                    vatAmount={order.vatAmount}
                                    grandTotal={order.grandTotal}
                                />
                            </Card.Body>
                        </Card>

                        <OrderShippingAddressPanel
                            customerName={order.customerName}
                            shippingAddress={order.shippingAddress}
                            trackingNumber={order.trackingNumber}
                            trackingCarrier={order.trackingCarrier}
                        />
                        <OrderPaymentPanel
                            payment={order.latestPayment}
                            statusHistory={order.statusHistory}
                        />
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

                <Card as="section" variant="bordered">
                    <Card.Header className="m-0 px-5 py-4">
                        Status History
                    </Card.Header>
                    <Card.Body className="p-5">
                        <OrderStatusHistory history={order.statusHistory}/>
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
