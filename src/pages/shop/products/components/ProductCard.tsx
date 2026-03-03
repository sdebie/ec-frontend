import React, { useState, useMemo } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import ProductImage from "@/components/shared/imageupload/ProductImage.tsx";

interface Variant {
    id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    attributes: Record<string, string>; // Matches your JSONB: {"color": "Black", "size": "L"}
}

interface ProductImageObject {
    id: string;
    imageUrl: string; // file name stored on server
    sortOrder?: number | null;
    isFeatured?: boolean | null;
}

interface Product {
    id: string;
    name: string;
    short_description: string;
    description: string;
    variants: Variant[];
    productImages?: ProductImageObject[] | null; // new: list of image objects
}

const ProductCard: React.FC<{ product: Product; onAddToCart: (vId: string) => void }> = ({ product, onAddToCart }) => {
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [openSection, setOpenSection] = useState<string | null>('Description');

    // 1. Extract Unique Attributes for UI Buttons
    const options = useMemo(() => {
        const map: Record<string, Set<string>> = {};
        product.variants.forEach((v) => {
            Object.entries(v.attributes).forEach(([key, value]) => {
                if (!map[key]) map[key] = new Set();
                map[key].add(value);
            });
        });
        return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Array.from(v)]));
    }, [product.variants]);

    // 2. Find the Active Variant based on selections
    const activeVariant = useMemo(() => {
        return product.variants.find((v) =>
            Object.entries(selections).every(([key, value]) => v.attributes[key] === value)
        );
    }, [selections, product.variants]);

    const handleSelect = (key: string, value: string) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
    };

    // Helpers to read image file names from productImages
    const mainImageFile = product.productImages && product.productImages.length > 0
        ? product.productImages[0].imageUrl
        : undefined;
    const thumbImages = product.productImages && product.productImages.length > 1
        ? product.productImages.slice(1, 3).map(img => img.imageUrl)
        : [];

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    {mainImageFile ? (
                        <ProductImage fileName={mainImageFile} alt={product.name} />
                    ) : (
                        <img src="https://via.placeholder.com/600" alt={product.name} className="w-full h-full object-center object-cover" />
                    )}
                </div>
                <div className="flex gap-4">
                    {thumbImages.length > 0 ? (
                        thumbImages.map((t, i) => (
                            <div key={i} className={`w-20 h-20 ${i === 0 ? 'border-2 border-blue-600' : 'border border-gray-200'} rounded-lg overflow-hidden cursor-pointer`}>
                                <ProductImage fileName={t} alt={`${product.name} thumb ${i}`} />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="w-20 h-20 border-2 border-blue-600 rounded-lg overflow-hidden cursor-pointer">
                                <img src="https://via.placeholder.com/100" className="object-cover h-full w-full" />
                            </div>
                            <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden cursor-pointer">
                                <img src="https://via.placeholder.com/100" className="object-cover h-full w-full" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Product Details */}
            <div className="flex flex-col">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                    <span className="text-xl font-semibold text-gray-900">
            R{activeVariant?.price ?? product.variants[0]?.price}
          </span>
                </div>
                <p className="text-gray-500 mt-2">{product.short_description}</p>

                {/* Dynamic Selectors from JSONB keys */}
                {Object.entries(options).map(([attrKey, values]) => (
                    <div key={attrKey} className="mt-8">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                            {attrKey}: <span className="text-gray-500 font-normal">{selections[attrKey] || 'Select'}</span>
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {values.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleSelect(attrKey, val)}
                                    className={`px-6 py-2 border-2 rounded-lg font-medium transition-all ${
                                        selections[attrKey] === val
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    disabled={!activeVariant || activeVariant.stock_quantity === 0}
                    onClick={() => activeVariant && onAddToCart(activeVariant.id)}
                    className="mt-10 w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart size={20} />
                    {activeVariant ? 'Add to cart' : 'Select Options'}
                </button>

                <div className="border p-4 rounded-lg bg-slate-800 text-white">
                    {/* Primary Image: Usually the first one in the sort_order */}
                    {mainImageFile ? (
                        <ProductImage
                            fileName={mainImageFile}
                            alt={product.name}
                        />
                    ) : (
                        <div className="h-48 bg-slate-700 flex items-center justify-center">
                            <span>No Image Available</span>
                        </div>
                    )}

                    <h3 className="mt-2 font-bold">{product.name}</h3>

                    {/* Small Thumbnails for the rest of the gallery */}
                    <div className="flex gap-2 mt-2">
                        {(product.productImages || []).slice(1).map((img, index) => (
                            <ProductImage
                                key={img.id || index}
                                fileName={img.imageUrl}
                                alt={`${product.name} gallery ${index}`}
                                className="w-10 h-10 object-cover rounded border border-slate-600"
                            />
                        ))}
                    </div>
                </div>

                {/* Expandable Sections */}
                <div className="mt-10 border-t border-gray-100">
                    {['Description', 'Product Details', 'Shipping & Returns'].map((section) => (
                        <div key={section} className="border-b border-gray-100">
                            <button
                                onClick={() => setOpenSection(openSection === section ? null : section)}
                                className="w-full py-4 flex justify-between items-center text-sm font-bold text-gray-900"
                            >
                                {section}
                                {openSection === section ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {openSection === section && (
                                <div className="pb-4 text-sm text-gray-600 animate-in fade-in slide-in-from-top-1">
                                    {section === 'Description' ? product.description : `Information about ${section.toLowerCase()} goes here.`}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;