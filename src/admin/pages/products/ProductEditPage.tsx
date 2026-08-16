import {Link, useNavigate, useParams} from 'react-router-dom'
import {PageLayout, PageLoadingSpinner, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useProductDetail} from '@/admin/hooks/products/useProductDetail'
import {useUpdateProduct} from '@/admin/hooks/products/useUpdateProduct'
import {useCategories} from '@/admin/hooks/products/useCategories'
import {useMediaDelete, useMediaUpload} from '@/admin/hooks/media'
import type {ProductFormValues} from './components/ProductForm'
import {ProductForm, toProductPayload} from './components/ProductForm'

export function ProductEditPage() {
    const {productId} = useParams<{ productId: string }>()
    const navigate = useNavigate()
    const {data: product, isLoading, notFound} = useProductDetail(productId!)
    const {mutateAsync: updateProduct, isLoading: isUpdating} = useUpdateProduct(productId!)
    const {data: categories = []} = useCategories()
    const {upload} = useMediaUpload()
    const {remove} = useMediaDelete()

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Products', href: '/admin/products'},
        {label: 'Edit Product'},
    ])

    // Handle not-found (GraphQL returns null for absent product)
    if (!isLoading && notFound) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-8">
                <div
                    className="w-full max-w-md rounded-xl p-8 text-center"
                    style={{
                        background: 'var(--c-panel, #ffffff)',
                        border: '1px solid var(--c-border, #e5e7eb)',
                        boxShadow: 'var(--c-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                    }}
                >
                    <h2
                        className="mb-2 text-xl font-semibold"
                        style={{color: 'var(--c-text, #111827)'}}
                    >
                        Not Found
                    </h2>
                    <p
                        className="mb-6 text-sm leading-relaxed"
                        style={{color: 'var(--c-text-muted, #6b7280)'}}
                    >
                        Product not found
                    </p>
                    <Link
                        to="/admin/products"
                        className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{
                            background: 'var(--c-accent, #2563eb)',
                            color: 'var(--c-accent-text, #ffffff)',
                        }}
                    >
                        Back to products
                    </Link>
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoading || !product) {
        return <PageLoadingSpinner/>
    }

    const defaultValues: Partial<ProductFormValues> = {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        status: product.status,
        categoryIds: product.categories.map((category) => category.id),
        images: product.images,
        imageIds: product.imageIds,
        variants: product.variants,
    }

    const handleSubmit = async (values: ProductFormValues) => {
        await updateProduct(toProductPayload(values))
        toast.success('Product updated successfully')
        navigate('/admin/products')
    }

    return (
        <PageLayout title="Edit Product">
            <ProductForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isUpdating}
                categories={categories}
                mode="edit"
                onUpload={upload}
                onCleanup={remove}
            />
        </PageLayout>
    )
}
