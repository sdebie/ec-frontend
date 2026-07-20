import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { toast, PageLayout, PageLoadingSpinner } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useCategoryDetail, useUpdateCategory } from '@/admin/hooks/categories'
import { CategoryForm } from './components/CategoryForm'
import type { CategoryFormValues } from './components/CategoryForm'

export function CategoryEditPage() {
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const { data: category, isLoading } = useCategoryDetail(categoryId!)

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Categories', href: '/admin/products/categories' },
    { label: 'Edit Category' },
  ])
  const mutation = useUpdateCategory(categoryId!)

  if (!canMutate) return <Navigate to="/admin/products/categories" replace />

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  if (!category) {
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
            Category not found
          </p>
          <Link
            to="/admin/products/categories"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  const defaultValues: Partial<CategoryFormValues> = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    imageUrl: category.imageUrl ?? '',
    parentId: category.parent?.id ?? null,
  }

  const handleSubmit = (values: CategoryFormValues) => {
    mutation.mutate(
      {
        name: values.name,
        slug: values.slug,
        description: values.description,
        imageUrl: values.imageUrl,
        parent: values.parentId ? { id: values.parentId } : null,
      },
      {
        onSuccess: () => {
          toast.success('Category updated successfully')
          navigate('/admin/products/categories')
        },
        onError: (error) => {
          console.error(error)
          toast.error('Failed to save category', { duration: 0 })
        },
      },
    )
  }

  return (
    <PageLayout title="Edit Category">
      <CategoryForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        editingCategoryId={categoryId}
      />
    </PageLayout>
  )
}
