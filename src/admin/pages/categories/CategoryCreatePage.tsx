import {Navigate, useNavigate} from 'react-router-dom'
import {PageLayout, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {useCreateCategory} from './hooks/useCreateCategory'
import type {CategoryFormValues} from './components/CategoryForm'
import {CategoryForm} from './components/CategoryForm'

export function CategoryCreatePage() {
    const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
    const navigate = useNavigate()
    const mutation = useCreateCategory()

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Brands & Categories', href: '/admin/products/brands'},
        {label: 'New Category'},
    ])

    if (!canMutate) return <Navigate to="/admin/products/categories" replace/>

    const handleSubmit = (values: CategoryFormValues) => {
        mutation.mutate(
            {
                name: values.name,
                slug: values.slug,
                description: values.description || undefined,
                imageUrl: values.imageUrl || undefined,
                parent: values.parentId ? {id: values.parentId} : null,
            },
            {
                onSuccess: () => {
                    toast.success('Category created successfully')
                    navigate('/admin/products/categories')
                },
                onError: (error) => {
                    console.error(error)
                    toast.error('Failed to create category', {duration: 0})
                },
            },
        )
    }

    return (
        <PageLayout title="Create Category">
            <CategoryForm onSubmit={handleSubmit} isSubmitting={mutation.isPending}/>
        </PageLayout>
    )
}
