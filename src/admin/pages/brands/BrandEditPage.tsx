import {Navigate, useNavigate, useParams} from 'react-router-dom'
import {FormPageNotFound, PageLayout, PageLoadingSpinner, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useCan} from '@/shared/auth/adminPermissions'
import {useBrandDetail} from './hooks/useBrandDetail'
import {useUpdateBrand} from './hooks/useUpdateBrand'
import type {BrandFormValues} from './components/BrandForm'
import {BrandForm} from './components/BrandForm'

export function BrandEditPage() {
    const canMutate = useCan('brand:write')
    const {brandId} = useParams<{ brandId: string }>()
    const navigate = useNavigate()
    const {data: brand, isLoading} = useBrandDetail(brandId!)

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Brands & Categories', href: '/admin/products/brands'},
        {label: 'Edit Brand'},
    ])
    const mutation = useUpdateBrand(brandId!)

    if (!canMutate) return <Navigate to="/admin/products/brands" replace/>

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (!brand) {
        return <FormPageNotFound entityName="Brand" backHref="/admin/products/brands" backLabel="Back to Brands"/>
    }

    const defaultValues: Partial<BrandFormValues> = {
        name: brand.name,
        slug: brand.slug,
        description: brand.description ?? '',
        logoUrl: brand.logoUrl ?? '',
    }

    const handleSubmit = (values: BrandFormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                toast.success('Brand updated successfully')
                navigate(-1)
            },
            onError: () => {
                toast.error('Failed to save brand', {duration: 0})
            },
        })
    }

    return (
        <PageLayout title="Edit Brand" onBack={() => navigate(-1)}>
            <BrandForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={mutation.isPending}
            />
        </PageLayout>
    )
}
