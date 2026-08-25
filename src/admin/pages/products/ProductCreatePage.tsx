import { useNavigate } from 'react-router-dom'
import { toast, PageLayout } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { useCreateProduct } from './hooks/useCreateProduct'
import { useCategories } from './hooks/useCategories'
import { useMediaUpload, useMediaDelete } from '@/admin/hooks/media'
import { ProductForm, toProductPayload } from './components/ProductForm'
import type { ProductFormValues } from './components/ProductForm'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync: createProduct, isLoading } = useCreateProduct()
  const { data: categories = [] } = useCategories()
  const { upload } = useMediaUpload()
  const { remove } = useMediaDelete()

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Add Product' },
  ])

  const handleSubmit = async (values: ProductFormValues) => {
    await createProduct(toProductPayload(values))
    toast.success('Product created successfully')
    navigate('/admin/products')
  }

  return (
    <PageLayout title="Add Product">
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        categories={categories}
        mode="create"
        onUpload={upload}
        onCleanup={remove}
      />
    </PageLayout>
  )
}
