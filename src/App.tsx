import {ToastContainer} from '@/components/shared/toast'
import {AppProviders} from '@/app/providers/AppProviders'
import {useAppComposition} from '@/app/bootstrap/useAppComposition'

function App() {
    const {router, storefrontOptions, manifestGeneratedAt} = useAppComposition()

    return (
        <AppProviders storefrontOptions={storefrontOptions} router={router}>
            {/* Manifest bootstrap seam loaded at app startup for normalization. */}
            <div
                data-storefront-manifest-generated={manifestGeneratedAt}
                className="hidden"
            />
            <ToastContainer/>
        </AppProviders>
    )
}

export default App
