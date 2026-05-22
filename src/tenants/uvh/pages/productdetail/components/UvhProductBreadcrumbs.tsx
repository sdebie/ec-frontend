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
            className="border-b border-(--sf-border) bg-(--sf-surface-muted) py-3"
        >
            <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 text-xs text-(--sf-muted-text) sm:px-6 sm:text-sm lg:px-8">
                <li>
                    <Link className="hover:text-(--sf-accent) hover:underline" to="/">
                        Home
                    </Link>
                </li>
                <li aria-hidden className="flex items-center">
                    <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                    <Link className="hover:text-(--sf-accent) hover:underline" to="/products">
                        Products
                    </Link>
                </li>
                <li aria-hidden className="flex items-center">
                    <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                    <Link
                        className="hover:text-(--sf-accent) hover:underline"
                        to={`/products?category=${encodeURIComponent(categoryName)}`}
                    >
                        {categoryName}
                    </Link>
                </li>
                <li aria-hidden className="flex items-center">
                    <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                    <span aria-current="page" className="font-semibold text-(--sf-text)">
                        {productName}
                    </span>
                </li>
            </ol>
        </nav>
    );
}
