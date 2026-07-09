import {QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {GoogleOAuthProvider} from '@react-oauth/google'
import {queryClient} from '@/shared/api/queryClient'
import {ToastContainer} from '@/shared/ui/components/toast'

interface Props {
    children: React.ReactNode
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export const AppProviders = ({children}: Props) => (
    <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
            {children}
            <ToastContainer/>
            {import.meta.env.DEV && <ReactQueryDevtools/>}
        </QueryClientProvider>
    </GoogleOAuthProvider>
)
