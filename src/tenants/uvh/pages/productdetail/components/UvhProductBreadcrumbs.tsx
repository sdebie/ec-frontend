import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type UvhProductBreadcrumbsProps = {
    categoryName: string;
    productName: string;
};

export function UvhProductBreadcrumbs({ categoryName, productName }: UvhProductBreadcrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="border-b border-(--sf-border) bg-(--sf-bg) py-2.5"
        >
            <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 text-xs text-(--sf-muted-text) sm:px-6 lg:px-8">
                <li>
                    <Link className="hover:text-(--sf-accent) hover:underline transition-colors" to="/">
                        Home
                    </Link>
                </li>
                <li aria-hidden className="flex items-center">
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                    <Link className="hover:text-(--sf-accent) hover:underline transition-colors" to="/products">
                        Products
                    </Link>
                </li>
                <li aria-hidden className="flex items-center">
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                    <Link
                        className="hover:text-(--sf-accent) hover:underline transition-colors"
                        to={`/products?category=${encodeURIComponent(categoryName)}`}
                    >
                        {categoryName}
                    </Link>
                </li>
                <li aria-hidden className="flex items-center">
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                    <span aria-current="page" className="font-medium text-(--sf-text) truncate max-w-[16rem] inline-block align-bottom">
                        {productName}
                    </span>
                </li>
            </ol>
        </nav>
    );
}
