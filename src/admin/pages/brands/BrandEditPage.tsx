import {Link, Navigate, useNavigate, useParams} from 'react-router-dom'
import {PageBackButton, PageLoadingSpinner, toast} from '@/shared/ui/components'
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
                        style={{color: 'var(--c-text, #111827)'}}
                    >
                        Not Found
                    </h2>
                    <p
                        className="mb-6 text-sm leading-relaxed"
                        style={{color: 'var(--c-text-muted, #6b7280)'}}
                    >
                        Brand not found
                    </p>
                    <Link
                        to="/admin/products/brands"
                        className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{
                            background: 'var(--c-accent, #2563eb)',
                            color: 'var(--c-accent-text, #ffffff)',
                        }}
                    >
                        Back to Brands
                    </Link>
                </div>
            </div>
        )
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
        <BrandForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            backButton={<PageBackButton/>}
        />
    )
}
