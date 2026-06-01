import {Bell, FileText, Minus, Plus, ShoppingCart} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getDisplayPriceForVariantTiers} from '@/features/catalog/utils/pricing.ts';
import {Button} from '@/primitives/button';
import {toast} from '@/components/shared/toast/toastStore.ts';
import {useCustomerType} from '@/store/customerTypeStore.ts';
import {cn} from '@/utils/cn';
import type {UvhDetailProduct, UvhDetailVariant} from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';


type UvhProductPurchasePanelProps = {
    product: UvhDetailProduct;
    onAddToCart: (variantId: string, unitPrice: number, quantity: number) => Promise<void> | void;
    onActiveVariantChange?: (variant: UvhDetailVariant | undefined) => void;
};

const formatPrice = (value: number): string => `R ${value.toFixed(2).replace('.', ',')}`;

function findVariantBySelections(
    variants: UvhDetailVariant[],
    selections: Record<string, string>,
): UvhDetailVariant | undefined {
    return variants.find((variant) =>
        Object.entries(selections).every(([key, value]) => variant.attributes[key] === value),
    );
}

export function UvhProductPurchasePanel({
                                            product,
                                            onAddToCart,
                                            onActiveVariantChange,
                                        }: UvhProductPurchasePanelProps) {
    const navigate = useNavigate();
    const customerType = useCustomerType();
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const optionGroups = useMemo(() => {
        const map: Record<string, Set<string>> = {};
        product.variants.forEach((variant) => {
            Object.entries(variant.attributes).forEach(([key, value]) => {
                if (!map[key]) map[key] = new Set();
                map[key].add(value);
            });
        });
        return Object.fromEntries(Object.entries(map).map(([key, values]) => [key, Array.from(values)]));
    }, [product.variants]);

    useEffect(() => {
        const defaults: Record<string, string> = {};
        Object.entries(optionGroups).forEach(([key, values]) => {
            if (values.length === 1) defaults[key] = values[0];
        });
        if (Object.keys(defaults).length > 0) {
            setSelections((prev) => ({...defaults, ...prev}));
        }
    }, [optionGroups]);

    const activeVariant = useMemo(
        () => findVariantBySelections(product.variants, selections) ?? product.variants[0],
        [product.variants, selections],
    );

    const pricePresentation = useMemo(() => {
        if (!activeVariant) return {price: 0, originalPrice: undefined as number | undefined};
        return getDisplayPriceForVariantTiers(
            {
                retailPrice: activeVariant.retailPrice,
                retailSalePrice: activeVariant.retailSalePrice,
                wholesalePrice: activeVariant.wholesalePrice,
                wholesaleSalePrice: activeVariant.wholesaleSalePrice,
            },
            customerType,
        );
    }, [activeVariant, customerType]);

    useEffect(() => {
        onActiveVariantChange?.(activeVariant);
    }, [activeVariant, onActiveVariantChange]);

    const inStock = (activeVariant?.stockQuantity ?? 0) > 0;
    const allOptionsSelected =
        Object.keys(optionGroups).length === 0 ||
        Object.keys(optionGroups).every((key) => Boolean(selections[key]));

    const handleAddToCart = async () => {
        if (!activeVariant || !inStock || !allOptionsSelected) return;
        setAdding(true);
        try {
            await onAddToCart(activeVariant.id, pricePresentation.price, quantity);
            toast.success(`${product.name} added to cart`, { title: 'Added to cart' });
        } catch {
            toast.error('Could not add item to cart. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--sf-accent)">
                    {product.categoryName}
                </p>
                <div className="flex flex-col items-end gap-0.5">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-(--sf-accent)/10 text-(--sf-accent)',
                        )}
                    >
                        <span
                            className={cn('h-1.5 w-1.5 rounded-full', inStock ? 'bg-emerald-600' : 'bg-(--sf-accent)')}
                            aria-hidden
                        />
                        {inStock ? 'In stock' : 'Out of stock'}
                    </span>
                    {activeVariant?.sku ? (
                        <p className="text-[10px] font-medium text-(--sf-muted-text)">SKU: {activeVariant.sku}</p>
                    ) : null}
                </div>
            </div>

            <div className="mt-1">
                <h1 className="text-lg font-bold tracking-tight text-(--sf-text) sm:text-xl">{product.name}</h1>
            </div>

            <div className="mt-3">
                <p className="text-2xl font-bold text-(--sf-accent) sm:text-3xl">
                    {formatPrice(pricePresentation.price)}
                    <span className="ml-2 text-sm font-semibold text-(--sf-muted-text)">Ex. VAT</span>
                </p>
                {pricePresentation.originalPrice != null &&
                pricePresentation.originalPrice > pricePresentation.price ? (
                    <p className="mt-0.5 text-sm text-(--sf-muted-text) line-through">
                        {formatPrice(pricePresentation.originalPrice)}
                    </p>
                ) : null}
            </div>

            {(product.shortDescription || product.description) ? (
                <p className="mt-4 text-sm leading-relaxed text-(--sf-muted-text)">
                    {product.shortDescription || product.description}
                </p>
            ) : null}

            {Object.entries(optionGroups).map(([key, values]) => (
                <div key={key} className="mt-6">
                    <p className="text-sm font-bold text-(--sf-text)">
                        {key}
                        {selections[key] ? (
                            <span className="ml-1 font-normal text-(--sf-muted-text)">· {selections[key]}</span>
                        ) : null}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {values.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setSelections((prev) => ({...prev, [key]: value}))}
                                className={cn(
                                    'rounded-lg border-2 px-4 py-2 text-sm font-medium transition',
                                    selections[key] === value
                                        ? 'border-(--sf-accent) text-(--sf-accent)'
                                        : 'border-(--sf-border) text-(--sf-muted-text) hover:border-(--sf-accent)/70',
                                )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mt-6">
                <p className="text-sm font-bold text-(--sf-text)">Quantity</p>
                <div className="mt-2 inline-flex items-center rounded-lg border border-(--sf-border)">
                    <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="px-3 py-2 text-(--sf-muted-text) hover:text-(--sf-accent) disabled:opacity-40"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                        <Minus className="h-4 w-4"/>
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-(--sf-text)" aria-live="polite">
                        {quantity}
                    </span>
                    <button
                        type="button"
                        aria-label="Increase quantity"
                        className="px-3 py-2 text-(--sf-muted-text) hover:text-(--sf-accent)"
                        onClick={() => setQuantity((q) => q + 1)}
                    >
                        <Plus className="h-4 w-4"/>
                    </button>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
                <Button
                    type="button"
                    fullWidth
                    size="md"
                    disabled={!inStock || !allOptionsSelected || adding}
                    loading={adding}
                    leftIcon={!inStock ? <Bell className="h-4 w-4"/> : <ShoppingCart className="h-4 w-4"/>}
                    className={cn(
                        !inStock && 'bg-(--sf-muted-text) hover:bg-(--sf-muted-text)',
                    )}
                    onClick={inStock ? handleAddToCart : undefined}
                >
                    {inStock
                        ? allOptionsSelected
                            ? 'Add to cart'
                            : 'Select options'
                        : 'Out of stock'}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    size="md"
                    leftIcon={<FileText className="h-4 w-4"/>}
                    className="border-(--sf-accent) text-(--sf-accent) hover:bg-(--sf-accent)/5"
                    onClick={() => {
                        const subject = encodeURIComponent(`Quote request: ${product.name}`);
                        void navigate(`/contact-us?subject=${subject}`);
                    }}
                >
                    Add to quote
                </Button>
            </div>
        </div>
    );
}
