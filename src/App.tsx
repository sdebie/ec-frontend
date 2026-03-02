import {Suspense} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import PageHeader from './components/PageHeader';
import AdminLayout from './admin/components/AdminLayout.tsx';
import {storeRoutes} from './configs/routes/storeRoutes.config.ts';
import {adminRoutes} from './configs/routes/adminRoutes.config';
import {getHostname} from './utils/HostnameResolver';

function App() {
    const hostname = getHostname();
    const isAdminDomain = hostname.startsWith('admin.');
    const isStoreDomain = hostname.startsWith('store.');

    // Determine which routes to show based on domain or path
    let routesToShow = [...storeRoutes, ...adminRoutes];

    // If we have specific subdomains, we can restrict routes
    if (isAdminDomain) {
        routesToShow = adminRoutes;
    } else if (isStoreDomain) {
        routesToShow = storeRoutes;
    }

    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    {routesToShow.map((route) => {
                        const Component = route.component;
                        const isAppAdmin = route.path.startsWith('/admin') || isAdminDomain;

                        const element = <Component {...(route.meta || {})} />;

                        return (
                            <Route
                                key={route.key}
                                path={route.path}
                                element={
                                    isAppAdmin ? (
                                        <AdminLayout>{element}</AdminLayout>
                                    ) : (
                                        <>
                                            <PageHeader/>
                                            {element}
                                        </>
                                    )
                                }
                            />
                        );
                    })}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;