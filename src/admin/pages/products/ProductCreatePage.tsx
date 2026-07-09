import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { toast, PageLayout } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { useCreateProduct } from '@/admin/hooks/products/useCreateProduct'
import { useCategories } from '@/admin/hooks/products/useCategories'
import { useMediaUpload, useMediaDelete } from '@/admin/hooks/media'
import { ProductForm } from './components/ProductForm'
import type { ProductFormValues } from './components/ProductForm'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const { mutate: createProduct, isLoading } = useCreateProduct()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { upload } = useMediaUpload()
  const { remove } = useMediaDelete()
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Add Product' },
  ])

  const handleSubmit = (values: ProductFormValues) => {
    setServerErrors({})

    createProduct(values, {
      onSuccess: () => {
        toast.success('Product created successfully')
        navigate('/admin/products')
      },
      onError: (error) => {
        if (
          isAxiosError(error) &&
          error.response?.data?.field === 'slug'
        ) {
          setServerErrors({
            slug: error.response.data.message || 'This slug is already in use',
          })
        } else {
          console.error(isAxiosError(error) ? error.response?.data : error)
          toast.error('Failed to create product', { duration: 0 })
        }
      },
    })
  }

  return (
    <PageLayout title="Add Product">
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        categories={categories}
        mode="create"
        onUpload={upload}
        onRemove={remove}
        serverErrors={serverErrors}
      />
    </PageLayout>
  )
}
