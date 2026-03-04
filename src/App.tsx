import {Suspense, useState, useEffect, JSX} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import PageHeader from './pages/shop/PageHeader.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import {storeRoutes} from './configs/routes/storeRoutes.config.ts';
import {adminRoutes} from './configs/routes/adminRoutes.config';
import {getHostname} from './utils/HostnameResolver';
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AccessDenied from './pages/shared/AccessDenied.tsx';
import { hasRequiredAuthority } from './utils/authorizationHelper.ts';
import ProductList from './pages/shop/products/ProductList.tsx';
import FloatingSection from "@/pages/shop/FloatingSection.tsx"; // Import ProductList

const renderRoutes = (routes: any[], isAdminDomain: boolean, isAuthenticated: boolean, handleLogin: () => void, activeCategory: string, setActiveCategory: (category: string) => void) => {
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
        let element;

        // Special handling for ProductList to pass activeCategory
        if (route.path === '/products' && !isAppAdmin) {
            element = <ProductList activeCategory={activeCategory} />;
        } else {
            element = <Component {...(route.meta || {})} />;
        }


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
                                // TODO: CurrencyProvider
                                <AdminLayout>{element}</AdminLayout>
                            ) : (
                                <AccessDenied />
                            )
                        ) : (
                            <Navigate to="/admin/login" />
                        )
                    ) : (
                        <>
                            <PageHeader activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
                            <FloatingSection />
                            {element}
                        </>
                    )
                }
            />
        );

        results.push(currentRoute);

        if (route.subMenu) {
            results.push(...renderRoutes(route.subMenu, isAdminDomain, isAuthenticated, handleLogin, activeCategory, setActiveCategory));
        }
    }

    return results;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
    const [activeCategory, setActiveCategory] = useState<string>('All'); // New state for active category

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
                    {renderRoutes(routesToShow, isAdminDomain, isAuthenticated, handleLogin, activeCategory, setActiveCategory)}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
