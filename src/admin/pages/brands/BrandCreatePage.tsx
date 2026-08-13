import {Navigate, useNavigate} from 'react-router-dom'
import {PageBackButton, toast} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {useCreateBrand} from '@/admin/hooks/brands'
import type {BrandFormValues} from './components/BrandForm'
import {BrandForm} from './components/BrandForm'

export function BrandCreatePage() {
    const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
    const navigate = useNavigate()
    const mutation = useCreateBrand()

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Products', href: '/admin/products'},
        {label: 'Brands', href: '/admin/products/brands'},
        {label: 'New Brand'},
    ])

    if (!canMutate) return <Navigate to="/admin/products/brands" replace/>

    const handleSubmit = (values: BrandFormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                toast.success('Brand created successfully')
                navigate('/admin/products/brands')
            },
            onError: (error) => {
                console.error(error)
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
