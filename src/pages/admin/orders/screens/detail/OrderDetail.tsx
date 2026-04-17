import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components";
import useOrderDetail from "@/pages/admin/orders/hooks/useOrderDetail.ts";
import { OrderStatusDisplay } from "@/constants/enums/OrderStatusDisplay.tsx";
import { asVariant } from "@/types/order.types.ts";
import { ArrowLeft } from "lucide-react";

const rv = (value?: string | number | boolean | null) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
    </section>
);

const Field = ({ label, value }: { label: string; value?: string | number | boolean | null }) => (
    <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">{label}</p>
        <p className="text-sm text-admin-text break-all">{rv(value)}</p>
    </div>
);

const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { order, isLoading, errorMsg } = useOrderDetail(id);

    return (
        <PageContainer>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-sm text-admin-text-muted hover:text-admin-text"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-2xl font-bold">Order Detail</h1>
                </div>

                {isLoading && <p className="text-sm text-admin-text-muted">Loading order details...</p>}
                {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                {!isLoading && !errorMsg && !order && <p className="text-sm text-admin-text-muted">Order not found.</p>}

                {!isLoading && !errorMsg && order && (
                    <>
                        {/* Order Overview */}
                        <Section title="Order Overview">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <Field label="Order ID" value={order.id} />
                                <Field label="Session ID" value={order.sessionId} />
                                <Field label="Created At" value={order.createdAt ? new Date(order.createdAt).toLocaleString() : undefined} />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Status</p>
                                    <OrderStatusDisplay status={order.status ?? ""} />
                                </div>
                                <Field label="Total Amount" value={order.totalAmount !== undefined ? `R ${Number(order.totalAmount).toFixed(2)}` : undefined} />
                                <Field label="Customer Email" value={order.customerEntity?.email} />
                            </div>
                        </Section>

                        {/* Shipping */}
                        <Section title="Shipping Information">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Phone" value={order.shippingPhone} />
                                <Field label="Address Line 1" value={order.shippingAddressLine1} />
                                <Field label="Address Line 2" value={order.shippingAddressLine2} />
                                <Field label="City" value={order.shippingCity} />
                                <Field label="Province" value={order.shippingProvince} />
                                <Field label="Postal Code" value={order.shippingPostalCode} />
                            </div>
                        </Section>

                        {/* Order Items */}
                        <Section title={`Items (${order.items?.length ?? 0})`}>
                            {order.items && order.items.length > 0 ? (
                                <div className="overflow-x-auto rounded border border-admin-border">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="border-b border-admin-border bg-admin-bg">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold text-admin-text-muted">#</th>
                                                <th className="px-3 py-2 font-semibold text-admin-text-muted">Product</th>
                                                <th className="px-3 py-2 font-semibold text-admin-text-muted">Variant ID</th>
                                                <th className="px-3 py-2 font-semibold text-admin-text-muted">Qty</th>
                                                <th className="px-3 py-2 font-semibold text-admin-text-muted">Unit Price</th>
                                                <th className="px-3 py-2 font-semibold text-admin-text-muted">Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, idx) => {
                                                const v = asVariant(item.variant);
                                                const lineTotal = (Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0)).toFixed(2);
                                                return (
                                                    <tr key={item.id ?? idx} className="border-b border-admin-border last:border-b-0">
                                                        <td className="px-3 py-2 text-admin-text-muted">{idx + 1}</td>
                                                        <td className="px-3 py-2 text-admin-text">{v?.product?.name ?? "—"}</td>
                                                        <td className="px-3 py-2 text-admin-text font-mono text-xs break-all">{v?.id ?? rv(item.variant as string)}</td>
                                                        <td className="px-3 py-2 text-admin-text">{rv(item.quantity)}</td>
                                                        <td className="px-3 py-2 text-admin-text">R {Number(item.unitPrice ?? 0).toFixed(2)}</td>
                                                        <td className="px-3 py-2 text-admin-text font-medium">R {lineTotal}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-admin-text-muted">No items.</p>
                            )}
                        </Section>

                        {/* Status History */}
                        <Section title={`Status History (${order.statusHistory?.length ?? 0})`}>
                            {order.statusHistory && order.statusHistory.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {order.statusHistory.map((h, idx) => (
                                        <div key={h.id ?? idx} className="flex items-start gap-4 rounded border border-admin-border p-3">
                                            <div className="flex-1 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Status</p>
                                                    <OrderStatusDisplay status={h.status ?? ""} />
                                                </div>
                                                <Field label="Changed By" value={h.changedBy} />
                                                <Field label="Comment" value={h.comment} />
                                                <Field label="Date" value={h.createdAt ? new Date(h.createdAt).toLocaleString() : undefined} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-admin-text-muted">No status history.</p>
                            )}
                        </Section>
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default OrderDetail;

