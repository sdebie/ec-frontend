import {Suspense, useState, useEffect, JSX} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import PageHeader from './components/PageHeader';
import AdminLayout from './admin/components/AdminLayout.tsx';
import {storeRoutes} from './configs/routes/storeRoutes.config.ts';
import {adminRoutes} from './configs/routes/adminRoutes.config';
import {getHostname} from './utils/HostnameResolver';
import AdminLogin from "./admin/components/AdminLogin.tsx";
import AccessDenied from './pages/AccessDenied.tsx';
import { hasRequiredAuthority } from './utils/authorizationHelper.ts';

const renderRoutes = (routes: any[], isAdminDomain: boolean, isAuthenticated: boolean, handleLogin: () => void) => {
    const results: JSX.Element[] = [];

    for (const route of routes) {
        const Component = route.component;

        if (route.key === 'admin.login') {
            results.push(
                <Route
                    key={route.key}
                    path={route.path}
                    element={isAuthenticated ? <Navigate to="/admin" /> : <Component onLoginSuccess={handleLogin} />}
                />
            );
            continue;
        }

        const isAppAdmin = route.path.startsWith('/admin') || isAdminDomain;
        const element = <Component {...(route.meta || {})} />;

        if (route.path === '/login') {
            results.push(
                <Route
                    key={route.key}
                    path={route.path}
                    element={isAuthenticated ? <Navigate to="/admin" /> : <AdminLogin onLoginSuccess={handleLogin} />}
                />
            );
            continue;
        }

        // Check if user has required authority for this route
        const userHasAuthorityForRoute = hasRequiredAuthority(route.authority);

        const currentRoute = (
            <Route
                key={route.key}
                path={route.path}
                element={
                    isAppAdmin ? (
                        isAuthenticated ? (
                            userHasAuthorityForRoute ? (
                                <AdminLayout>{element}</AdminLayout>
                            ) : (
                                <AccessDenied />
                            )
                        ) : (
                            <Navigate to="/admin/login" />
                        )
                    ) : (
                        <>
                            <PageHeader/>
                            {element}
                        </>
                    )
                }
            />
        );

        results.push(currentRoute);

        if (route.subMenu) {
            results.push(...renderRoutes(route.subMenu, isAdminDomain, isAuthenticated, handleLogin));
        }
    }

    return results;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem('admin_token'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const hostname = getHostname();
    const isAdminDomain = hostname.startsWith('admin.');
    const isStoreDomain = hostname.startsWith('store.');

    let routesToShow = [...storeRoutes, ...adminRoutes];

    if (isAdminDomain) {
        routesToShow = adminRoutes;
    } else if (isStoreDomain) {
        routesToShow = storeRoutes;
    }

    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    {renderRoutes(routesToShow, isAdminDomain, isAuthenticated, handleLogin)}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
