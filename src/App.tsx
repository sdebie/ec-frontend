import {Suspense, useEffect, useState} from 'react';
import {ToastContainer} from '@/components/shared/toast';
import {storeRoutingRoutes} from './configs/routes/store/storePageRoutes.config.ts';
import {adminRoutingRoutes} from './configs/routes/admin/adminPageRoutes.config.ts';
import {getHostname} from './utils/HostnameResolver';
import {validateStorefrontPageInfrastructure} from '@/configs/storefront/storefrontPageValidation.ts';
import {AppProviders} from '@/app/providers/AppProviders';
import {AppRouter} from '@/app/router/AppRouter';

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

    const isAdminDomain = hostname.startsWith('admin.');
    const isStoreDomain = hostname.startsWith('store.');

    let routesToShow = [...storeRoutingRoutes, ...adminRoutingRoutes];
    if (isAdminDomain) routesToShow = adminRoutingRoutes;
    else if (isStoreDomain) routesToShow = storeRoutingRoutes;

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <AppProviders storefrontOptions={{hostname, forcedClientId}}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                <AppRouter
                    routes={routesToShow}
                    isAuthenticated={isAuthenticated}
                    isAdminDomain={isAdminDomain}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    onLoginSuccess={handleLogin}
                />
            </Suspense>
            <ToastContainer/>
        </AppProviders>
    );
}

export default App;
