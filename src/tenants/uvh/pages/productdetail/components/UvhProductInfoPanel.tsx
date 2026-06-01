import { CheckCircle2 } from 'lucide-react';

import { UvhProductAccordion } from '@/tenants/uvh/pages/productdetail/components/UvhProductAccordion.tsx';
import { UvhProductPurchasePanel } from '@/tenants/uvh/pages/productdetail/components/UvhProductPurchasePanel.tsx';
import { buildSpecificationRows } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';
import type { UvhDetailProduct, UvhDetailVariant } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';

type UvhProductInfoPanelProps = {
    product: UvhDetailProduct;
    activeVariant?: UvhDetailVariant;
    featureLines?: string[];
    onAddToCart: (variantId: string, unitPrice: number, quantity: number) => Promise<void> | void;
    onActiveVariantChange?: (variant: UvhDetailVariant | undefined) => void;
};

export function UvhProductInfoPanel({
    product,
    activeVariant,
    featureLines = [],
    onAddToCart,
    onActiveVariantChange,
}: UvhProductInfoPanelProps) {
    const specRows = buildSpecificationRows(activeVariant, product.name);
    const description = product.description || product.shortDescription;

    return (
        <div>
            <UvhProductPurchasePanel
                product={product}
                onAddToCart={onAddToCart}
                onActiveVariantChange={onActiveVariantChange}
            />

            <div className="mt-6">
                <UvhProductAccordion title="Product Description" defaultOpen>
                    {description ? (
                        <p className="text-sm leading-relaxed text-(--sf-muted-text)">{description}</p>
                    ) : (
                        <p className="text-sm text-(--sf-muted-text)">No description available.</p>
                    )}
                </UvhProductAccordion>

                <UvhProductAccordion title="Specifications">
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
                        <p className="text-sm text-(--sf-muted-text)">Select a variant to see specifications.</p>
                    )}
                </UvhProductAccordion>

                <div className="border-t border-(--sf-border)" />
            </div>

            {featureLines.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-2">
                    {featureLines.map((line) => (
                        <div
                            key={line}
                            className="flex items-start gap-2 rounded-lg border border-(--sf-border) bg-(--sf-panel) p-3"
                        >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--sf-accent)" aria-hidden />
                            <p className="text-xs leading-relaxed text-(--sf-text)">{line}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
