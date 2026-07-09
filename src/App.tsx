import {RouterProvider} from 'react-router-dom'
import {StorefrontConfigProvider} from '@/app/providers/StorefrontConfigProvider'
import {router} from '@/app/router/router'

function App() {
    return (
        <StorefrontConfigProvider>
            <RouterProvider router={router}/>
        </StorefrontConfigProvider>
    )
}

export default App
