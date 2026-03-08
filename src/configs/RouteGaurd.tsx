import {Navigate} from 'react-router-dom';
import {hasRequiredAuthority} from '@/utils/authorizationHelper';
import AdminLayout from '@/pages/admin/layout/AdminLayout.tsx';
import PageHeader from '@/pages/shop/PageHeader';
import FloatingSection from '@/pages/shop/FloatingSection';
import {AdminThemeProvider} from "@/context/AdminThemeContext";

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
                        setActiveCategory,
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
        <div className="min-h-screen bg-background text-foreground">
            <PageHeader activeCategory={activeCategory} onSelectCategory={setActiveCategory}/>
            <FloatingSection/>
            <div className="container mx-auto px-4 py-6">
                <Component activeCategory={activeCategory} {...(meta || {})} />
            </div>
        </div>
    );
};

export default RouteGuard;