import {Navigate} from 'react-router-dom';
import {hasRequiredAuthority} from '@/utils/authorizationHelper.ts';
import AdminLayout from '@/components/layout/admin/AdminLayout.tsx';
import {AdminThemeProvider} from "@/context/AdminThemeContext.tsx";
import {StorefrontThemeProvider} from "@/context/StorefrontThemeProvider.tsx";
import {StorefrontClientConfig} from "@/types/storefront/storefrontTypes.ts";
import PageHeader from "@/pages/shop/default/PageHeader.tsx";
import Footer from "@/components/layout/store/Footer.tsx";

interface RouteGuardProps {
    route: any;
    isAuthenticated: boolean;
    isAdminDomain: boolean;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onLoginSuccess: () => void; // Add this back!
    storefrontConfig: StorefrontClientConfig;
}

const RouteGuard = ({
                        route,
                        isAuthenticated,
                        isAdminDomain,
                        activeCategory,
                        onLoginSuccess,
                        storefrontConfig,
                        setActiveCategory,
                    }: RouteGuardProps) => {

    const {component: Component, path, authority, meta} = route;
    const isAppAdmin = path.startsWith('/admin') || isAdminDomain;
    const adminUserRaw = localStorage.getItem('admin_user');
    const shouldResetPassword = !!adminUserRaw && (() => {
        try {
            const user = JSON.parse(adminUserRaw) as { resetPassword?: boolean };
            return !!user.resetPassword;
        } catch {
            return false;
        }
    })();

    // Handle Login routes first and pass the callback
    if (path === '/admin/login' || path === '/login') {
        return isAuthenticated ? (
            <Navigate to={shouldResetPassword ? "/admin/reset-password" : "/admin"} replace/>
        ) : (
            <Component onLoginSuccess={onLoginSuccess} {...(meta || {})} />
        );
    }

    if (path === '/admin/reset-password') {
        if (!isAuthenticated) return <Navigate to="/admin/login" replace/>;
        if (!shouldResetPassword) return <Navigate to="/admin" replace/>;
        return <Component {...(meta || {})} />;
    }

    // Protection Logic for Admin
    if (isAppAdmin) {
        if (!isAuthenticated) return <Navigate to="/admin/login" replace/>;
        if (shouldResetPassword) return <Navigate to="/admin/reset-password" replace/>;

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
        <StorefrontThemeProvider clientConfig={storefrontConfig}>
            <PageHeader
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                storefrontConfig={storefrontConfig}
            />
            <div className="flex-1 container mx-auto px-4 py-6">
                <Component
                    activeCategory={activeCategory}
                    storefrontConfig={storefrontConfig}
                    {...(meta || {})}
                />
            </div>
            <Footer
                branding={storefrontConfig.branding}
                footer={storefrontConfig.footer}
            />
        </StorefrontThemeProvider>
    );
};

export default RouteGuard;