import {Navigate, useNavigate, useParams} from 'react-router-dom'
import {PageLayout, FormPageNotFound, PageLoadingSpinner, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useCan} from '@/shared/auth/adminPermissions'
import {mutationErrorMessage} from '@/admin/utils'
import {useCategoryDetail} from './hooks/useCategoryDetail'
import {useUpdateCategory} from './hooks/useUpdateCategory'
import type {CategoryFormValues} from './components/CategoryForm'
import {CategoryForm} from './components/CategoryForm'

export function CategoryEditPage() {
    const canMutate = useCan('category:write')
    const {categoryId} = useParams<{ categoryId: string }>()
    const navigate = useNavigate()
    const {data: category, isLoading} = useCategoryDetail(categoryId!)

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Brands & Categories', href: '/admin/products/brands'},
        {label: 'Edit Category'},
    ])
    const mutation = useUpdateCategory(categoryId!)

    if (!canMutate) return <Navigate to="/admin/products/categories" replace/>

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (!category) {
        return (
            <FormPageNotFound entityName="Category" backHref="/admin/products/categories" backLabel="Back to Categories"/>
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
                parent: values.parentId ? {id: values.parentId} : null,
            },
            {
                onSuccess: () => {
                    toast.success('Category updated successfully')
                    navigate(-1)
                },
                onError: (error) => {
                    toast.error(mutationErrorMessage(error, 'Failed to save category'), {duration: 0})
                },
            },
        )
    }

    return (
        <PageLayout title="Edit Category" onBack={() => navigate(-1)}>
            <CategoryForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={mutation.isPending}
                editingCategoryId={categoryId}
            />
        </PageLayout>
    )
}
