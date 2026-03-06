import {Suspense, useState, useEffect} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {storeRoutes} from './configs/routes/storeRoutes.config';
import {adminRoutes} from './configs/routes/adminRoutes.config';
import {getHostname} from './utils/HostnameResolver';
import RouteGuard from "@/configs/RouteGaurd.tsx";

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        const syncAuth = () => setIsAuthenticated(!!localStorage.getItem('admin_token'));
        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, []);

    const hostname = getHostname();
    const isAdminDomain = hostname.startsWith('admin.');
    const isStoreDomain = hostname.startsWith('store.');

    let routesToShow = [...storeRoutes, ...adminRoutes];
    if (isAdminDomain) routesToShow = adminRoutes;
    else if (isStoreDomain) routesToShow = storeRoutes;

    const flattenRoutes = (routes: any[]): any[] => {
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
                                />
                            }
                        />
                    ))}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;