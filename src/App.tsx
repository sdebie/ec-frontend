import {useAppComposition} from '@/app/bootstrap/useAppComposition'
import {AppProviders} from '@/app/providers/AppProviders'
import {ToastContainer} from '@/components/shared/toast'
import {useCustomerTypeUrlBootstrap} from '@/store/customerTypeStore.ts'

function CustomerTypeBootstrap() {
    useCustomerTypeUrlBootstrap()
    return null
}

function App() {
    const {router, storefrontOptions, manifestGeneratedAt} = useAppComposition()

    return (
        <AppProviders storefrontOptions={storefrontOptions} router={router}>
            {/* Manifest bootstrap seam loaded at app startup for normalization. */}
            <div
                data-storefront-manifest-generated={manifestGeneratedAt}
                className="hidden"
            />
            <CustomerTypeBootstrap/>
            <ToastContainer/>
        </AppProviders>
    )
}

export default App
