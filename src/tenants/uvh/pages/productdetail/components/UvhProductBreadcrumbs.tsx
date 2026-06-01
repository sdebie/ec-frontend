import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type UvhProductBreadcrumbsProps = {
    categoryName: string;
    productName: string;
    dark?: boolean;
};

export function UvhProductBreadcrumbs({ categoryName, productName, dark }: UvhProductBreadcrumbsProps) {
    const linkCls = dark
        ? 'hover:text-(--sf-accent) hover:underline transition-colors text-white/60'
        : 'hover:text-(--sf-accent) hover:underline transition-colors';
    const separatorCls = dark ? 'text-white/40' : '';
    const currentCls = dark
        ? 'font-medium text-white/90 truncate max-w-[16rem] inline-block align-bottom'
        : 'font-medium text-(--sf-text) truncate max-w-[16rem] inline-block align-bottom';

    return (
        <nav aria-label="Breadcrumb" className={dark ? 'mb-0' : 'border-b border-(--sf-border) bg-(--sf-bg) py-2.5'}>
            <ol className={`flex flex-wrap items-center gap-1 text-sm ${dark ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
                <li>
                    <Link className={linkCls} to="/">Home</Link>
                </li>
                <li aria-hidden className={`flex items-center ${separatorCls}`}>
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                    <Link className={linkCls} to="/products">Products</Link>
                </li>
                <li aria-hidden className={`flex items-center ${separatorCls}`}>
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                    <Link aria-current="page" className={linkCls} to={`/products?category=${encodeURIComponent(categoryName)}`}>
                        {categoryName}
                    </Link>
                </li>
            </ol>
        </nav>
    );
}
