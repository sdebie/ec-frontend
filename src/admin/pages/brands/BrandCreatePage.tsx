import {Navigate, useNavigate} from 'react-router-dom'
import {PageBackButton, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useCan} from '@/shared/auth/adminPermissions'
import {useCreateBrand} from './hooks/useCreateBrand'
import type {BrandFormValues} from './components/BrandForm'
import {BrandForm} from './components/BrandForm'

export function BrandCreatePage() {
    const canMutate = useCan('brand:write')
    const navigate = useNavigate()
    const mutation = useCreateBrand()

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Brands & Categories', href: '/admin/products/brands'},
        {label: 'New Brand'},
    ])

    if (!canMutate) return <Navigate to="/admin/products/brands" replace/>

    const handleSubmit = (values: BrandFormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                toast.success('Brand created successfully')
                navigate(-1)
            },
            onError: () => {
                toast.error('Failed to create brand', {duration: 0})
            },
        })
    }

    return (
        <BrandForm
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            backButton={<PageBackButton/>}
        />
    )
}
