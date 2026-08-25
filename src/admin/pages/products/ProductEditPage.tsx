import {useNavigate, useParams} from 'react-router-dom'
import {FormPageNotFound, PageLayout, PageLoadingSpinner, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useProductDetail} from './hooks/useProductDetail'
import {useUpdateProduct} from './hooks/useUpdateProduct'
import {useCategories} from './hooks/useCategories'
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
        return <FormPageNotFound entityName="Product" backHref="/admin/products" backLabel="Back to products"/>
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
