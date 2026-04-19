import {Suspense, useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ToastContainer} from '@/components/shared/toast';
import {storeRoutingRoutes} from './configs/routes/store/storePageRoutes.config.ts';
import {adminRoutingRoutes} from './configs/routes/admin/adminPageRoutes.config.ts';
import {getHostname} from './utils/HostnameResolver';
import RouteGuard from "@/configs/routes/RouteGaurd.tsx";
import {RouteObject} from "@/types/routes.ts";
import {resolveStorefrontClient} from "@/configs/storefront/storefrontRegistry.ts";
import {validateStorefrontPageInfrastructure} from '@/configs/storefront/storefrontPageValidation.ts';

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        const syncAuth = () => setIsAuthenticated(!!localStorage.getItem('admin_token'));
        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, []);

    useEffect(() => {
        if (import.meta.env.VITE_STORE_FRONT) {
            validateStorefrontPageInfrastructure();
        }
    }, []);

    const hostname = getHostname();
    const forcedClientId = import.meta.env.VITE_STORE_FRONT;
    const storefrontConfig = resolveStorefrontClient(hostname, forcedClientId);

    const isAdminDomain = hostname.startsWith('admin.');
    const isStoreDomain = hostname.startsWith('store.');

    let routesToShow = [...storeRoutingRoutes, ...adminRoutingRoutes];
    if (isAdminDomain) routesToShow = adminRoutingRoutes;
    else if (isStoreDomain) routesToShow = storeRoutingRoutes;

    const flattenRoutes = (routes: RouteObject[]): RouteObject[] => {
        return routes.flatMap((route) => [
            route,
            ...(route.subMenu ? flattenRoutes(route.subMenu) : [])
        ]);
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                <Routes>
                    {flattenRoutes(routesToShow).map((route) => (
                        <Route
                            key={route.key}
                            path={route.path}
                            element={
                                <RouteGuard
                                    route={route}
                                    isAuthenticated={isAuthenticated}
                                    isAdminDomain={isAdminDomain}
                                    activeCategory={activeCategory}
                                    setActiveCategory={setActiveCategory}
                                    onLoginSuccess={handleLogin}
                                    storefrontConfig={storefrontConfig}
                                />
                            }
                        />
                    ))}
                </Routes>
            </Suspense>
            <ToastContainer/>
        </BrowserRouter>
    );
}

export default App;
