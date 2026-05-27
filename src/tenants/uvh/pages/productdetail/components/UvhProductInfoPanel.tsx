import { UvhProductAccordion } from '@/tenants/uvh/pages/productdetail/components/UvhProductAccordion.tsx';
import { UvhProductPurchasePanel } from '@/tenants/uvh/pages/productdetail/components/UvhProductPurchasePanel.tsx';
import { buildSpecificationRows } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';
import type { UvhDetailProduct, UvhDetailVariant } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';

type UvhProductInfoPanelProps = {
    product: UvhDetailProduct;
    activeVariant?: UvhDetailVariant;
    onAddToCart: (variantId: string, unitPrice: number, quantity: number) => Promise<void> | void;
    onActiveVariantChange?: (variant: UvhDetailVariant | undefined) => void;
};

export function UvhProductInfoPanel({
    product,
    activeVariant,
    onAddToCart,
    onActiveVariantChange,
}: UvhProductInfoPanelProps) {
    const specRows = buildSpecificationRows(activeVariant, product.name);

    return (
        <div>
            <UvhProductPurchasePanel
                product={product}
                onAddToCart={onAddToCart}
                onActiveVariantChange={onActiveVariantChange}
            />

            <div className="mt-6">
                <UvhProductAccordion title="Additional information">
                    {specRows.length > 0 ? (
                        <table className="w-full border-collapse text-sm">
                            <tbody>
                                {specRows.map((row, index) => (
                                    <tr
                                        key={`${row.label}-${row.value}`}
                                        className={index % 2 === 0 ? 'bg-(--sf-surface-muted)' : ''}
                                    >
                                        <th
                                            scope="row"
                                            className="w-2/5 px-3 py-2.5 text-left text-xs font-semibold text-(--sf-text)"
                                        >
                                            {row.label}
                                        </th>
                                        <td className="px-3 py-2.5 text-xs text-(--sf-muted-text)">{row.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-(--sf-muted-text)">No additional information available.</p>
                    )}
                </UvhProductAccordion>

                <UvhProductAccordion title="Reviews (0)">
                    <p className="text-sm text-(--sf-muted-text)">
                        There are no reviews yet. Be the first to review this product.
                    </p>
                </UvhProductAccordion>

                <div className="border-t border-(--sf-border)" />
            </div>
        </div>
    );
}
