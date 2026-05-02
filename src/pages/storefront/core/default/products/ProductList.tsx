import React, {useEffect, useState} from 'react';
import {apiGetShoppingProductsList} from '@/services/graphql/product/product.service.ts';
import {ProductShoppingListItem, VariantPrice} from '@/types/admin/ProductTypes.ts';
import {useAddToCart} from '@/pages/storefront/core/default/cart/hook/useAddToCart.ts';
import {Link} from "react-router-dom";
import ProductImage from "@/components/shared/imageupload/ProductImage.tsx";
import { SfButton } from '@/components/storefront';

const toPriceNumber = (val?: VariantPrice | number | null): number | null => {
    if (typeof val === 'number') return val;
    if (val && typeof val.price === 'number') return val.price;
    return null;
};

const currency = (val?: VariantPrice | number | null) => {
    const amount = toPriceNumber(val);
    return amount != null ? `R ${amount.toFixed(2)}` : '—';
};

interface ProductListProps {
    activeCategory: string;
}

const ProductList: React.FC<ProductListProps> = ({activeCategory}) => {

    const [items, setItems] = useState<ProductShoppingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {createOrder} = useAddToCart();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const list = await apiGetShoppingProductsList(activeCategory);
                setItems(list);
            } catch (e: any) {
                console.error('Failed to load products', e);
                setError(e?.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        })();
    }, [activeCategory]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Products</h1>

            {loading && <div>Loading…</div>}
            {error && <div className="text-(--sf-error)">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((p) => {
                    const mainImage = p.images?.[0]?.imageUrl;
                    const primaryVariantId = p.variantId;
                    const variantCount = p.variantCount;
                    const retailPrice = toPriceNumber(p.retailPrice) ?? 0;
                    const retailSalePrice = toPriceNumber(p.retailSalePrice);
                    const wholesalePrice = toPriceNumber(p.wholesalePrice) ?? 0;
                    const wholesaleSalePrice = toPriceNumber(p.wholesaleSalePrice);
                    const selectedRetailPrice = retailSalePrice != null && retailSalePrice < retailPrice
                        ? retailSalePrice
                        : retailPrice;

                    return (
                        <div key={p.id} className="border border-(--sf-border) rounded-lg overflow-hidden bg-(--sf-panel) shadow-sm">
                            <div className="w-full h-40 bg-(--sf-bg) overflow-hidden flex items-center justify-center">
                                {mainImage ? (
                                    <ProductImage
                                        fileName={mainImage}
                                        alt={p.name}
                                        className="w-45 h-full object-cover rounded-md"
                                    />
                                ) : (
                                    <img
                                        src={mainImage}
                                        alt={p.name}
                                        className="w-full h-40 object-cover"
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="font-semibold text-(--sf-text) mb-1">{p.name}</div>
                                <div className="text-sm text-(--sf-muted-text) mb-3 line-clamp-3">{p.shortDescription}</div>
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        {retailSalePrice != null && retailSalePrice < retailPrice ? (
                                            <>
                                                <div className="text-lg font-bold text-(--sf-success)">{currency(retailSalePrice)}</div>
                                                <div className="text-sm text-(--sf-muted-text) line-through">
                                                    {currency(retailPrice)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-lg font-bold">{currency(retailPrice)}</div>
                                        )}
                                    </div>
                                    <div>
                                        {wholesaleSalePrice != null && wholesaleSalePrice < wholesalePrice ? (
                                            <>
                                                <div className="text-lg font-bold text-(--sf-success)">{currency(wholesaleSalePrice)}</div>
                                                <div className="text-sm text-(--sf-muted-text) line-through">
                                                    {currency(wholesalePrice)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-lg font-bold">{currency(wholesalePrice)}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    {primaryVariantId && (
                                        <SfButton
                                            onClick={() => {
                                                const orderItem = {
                                                    quantity: 1,
                                                    unitPrice: selectedRetailPrice,
                                                    variant: String(primaryVariantId),
                                                };
                                                createOrder({
                                                    items: [orderItem],
                                                });
                                            }}
                                            className="px-3 py-1.5 rounded text-sm whitespace-nowrap"
                                        >
                                            Add to Cart
                                        </SfButton>
                                    )}
                                    {primaryVariantId ? (
                                        <Link to={`/product/${p.id}`}
                                              className="px-3 py-1.5 bg-(--sf-border) text-(--sf-text) rounded hover:opacity-80 text-sm whitespace-nowrap">
                                            View
                                        </Link>
                                    ) : (
                                        <Link to={`/product/${p.id}`}
                                              className="px-3 py-1.5 bg-(--sf-border) text-(--sf-text) rounded hover:opacity-80 text-sm whitespace-nowrap">
                                            <span className="text-sm text-(--sf-muted-text) whitespace-nowrap">Select 1 of {variantCount} options</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductList;
