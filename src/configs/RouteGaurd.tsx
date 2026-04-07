import {Navigate} from 'react-router-dom';
import {hasRequiredAuthority} from '@/utils/authorizationHelper';
import AdminLayout from '@/components/layout/admin/AdminLayout.tsx';
import {AdminThemeProvider} from "@/context/AdminThemeContext";
import { StorefrontThemeProvider } from '@/components/layout/store/default/theme';
import { getStorefrontThemeConfig } from '@/storefronts/default';

interface RouteGuardProps {
    route: any;
    isAuthenticated: boolean;
    isAdminDomain: boolean;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onLoginSuccess: () => void; // Add this back!
}

const RouteGuard = ({
                        route,
                        isAuthenticated,
                        isAdminDomain,
                        activeCategory,
                        onLoginSuccess
                    }: RouteGuardProps) => {

    const {component: Component, path, authority, meta} = route;
    const isAppAdmin = path.startsWith('/admin') || isAdminDomain;

    // Handle Login routes first and pass the callback
    if (path === '/admin/login' || path === '/login') {
        return isAuthenticated ? (
            <Navigate to="/admin" replace/>
        ) : (
            <Component onLoginSuccess={onLoginSuccess} {...(meta || {})} />
        );
    }

    // Protection Logic for Admin
    if (isAppAdmin) {
        if (!isAuthenticated) return <Navigate to="/admin/login" replace/>;

        const userHasAuthority = hasRequiredAuthority(authority);
        if (!userHasAuthority) return <Navigate to="/access-denied" replace/>;

        return (
            <AdminThemeProvider>
                <AdminLayout>
                    <Component {...(meta || {})} />
                </AdminLayout>
            </AdminThemeProvider>
        );
    }

    // Store Logic
    return (
        <StorefrontThemeProvider config={getStorefrontThemeConfig()}>
            <Component activeCategory={activeCategory} {...(meta || {})} />
        </StorefrontThemeProvider>
    );
};

export default RouteGuard;