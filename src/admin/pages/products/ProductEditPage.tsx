import { useParams, useNavigate, Link } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { toast, PageLoadingSpinner, PageLayout } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { useProductDetail } from '@/admin/hooks/products/useProductDetail'
import { useUpdateProduct } from '@/admin/hooks/products/useUpdateProduct'
import { useCategories } from '@/admin/hooks/products/useCategories'
import { useMediaUpload, useMediaDelete } from '@/admin/hooks/media'
import { ProductForm, toProductPayload } from './components/ProductForm'
import type { ProductFormValues } from './components/ProductForm'

export function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProductDetail(productId!)
  const { mutate: updateProduct, isLoading: isUpdating } = useUpdateProduct(productId!)
  const { data: categories = [] } = useCategories()
  const { upload } = useMediaUpload()
  const { remove } = useMediaDelete()

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Edit Product' },
  ])

  // Handle 404
  if (!isLoading && (error as AxiosError)?.response?.status === 404) {
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
            style={{ color: 'var(--c-text, #111827)' }}
          >
            Not Found
          </h2>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: 'var(--c-text-muted, #6b7280)' }}
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
    return <PageLoadingSpinner />
  }

  const defaultValues: Partial<ProductFormValues> = {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    status: product.status,
    categoryId: product.category.id,
    images: product.images,
    variants: product.variants,
  }

  const handleSubmit = (values: ProductFormValues) => {
    updateProduct(toProductPayload(values), {
      onSuccess: () => {
        toast.success('Product updated successfully')
        navigate('/admin/products')
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message?: string }>
        console.error(axiosErr.response?.data ?? err)
        toast.error('Failed to save product', { duration: 0 })
      },
    })
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
        onRemove={remove}
      />
    </PageLayout>
  )
}
