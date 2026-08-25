import {RouterProvider} from 'react-router-dom'
import {router} from '@/app/router/router'
import {MaintenanceBoundary} from '@/app/maintenance/MaintenanceBoundary'
// import {WhatsAppButton} from '@/shared/ui/components'

function App() {
    return (
        <MaintenanceBoundary>
            <RouterProvider router={router}/>
            {/*<WhatsAppButton*/}
            {/*    phoneNumber="15551234567"*/}
            {/*    message="Hi! I have a question about my account."*/}
            {/*/>*/}
        </MaintenanceBoundary>
    )
}

export default App


