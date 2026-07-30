import {RouterProvider} from 'react-router-dom'
import {router} from '@/app/router/router'
import {MaintenanceBoundary} from '@/app/maintenance/MaintenanceBoundary'

function App() {
    return (
        <MaintenanceBoundary>
            <RouterProvider router={router}/>
        </MaintenanceBoundary>
    )
}

export default App
