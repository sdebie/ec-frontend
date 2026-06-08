import {Link} from 'react-router-dom';

import type {ReactNode} from 'react';

export interface StorefrontNavLinkProps {
    to: string;
    /** When true, renders an <a> with target="_blank" regardless of the URL. */
    external?: boolean;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}

const isHttpUrl = (href: string) => /^https?:\/\//i.test(href);

/**
 * Returns the pathname+search+hash for a same-origin absolute URL, or null
 * if the URL is external or cannot be parsed.
 */
const toSameOriginPath = (href: string): string | null => {
    if (typeof window === 'undefined' || !isHttpUrl(href)) return null;
    try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) return null;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
};

/**
 * StorefrontNavLink — smart link primitive for storefront navigation.
 *
 * Handles four cases consistently:
 *  1. `external` flag  → <a target="_blank" rel="noopener noreferrer">
 *  2. Same-origin absolute URL  → React Router <Link> (client-side navigation)
 *  3. Other absolute HTTP URL   → plain <a> (full page load)
 *  4. Relative path             → React Router <Link>
 *
 * Used by PageHeader (desktop + mobile nav) and Footer (column links, legal links).
 * Replaces the duplicated `renderNavItem` / `FooterLink` patterns that previously
 * existed in both files.
 */
export function StorefrontNavLink({to, external, className, onClick, children}: StorefrontNavLinkProps) {
    if (external) {
        return (
            <a href={to} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
                {children}
            </a>
        );
    }

    const internalPath = toSameOriginPath(to);
    if (internalPath !== null) {
        return (
            <Link to={internalPath} className={className} onClick={onClick}>
                {children}
            </Link>
        );
    }

    if (isHttpUrl(to)) {
        return (
            <a href={to} className={className} onClick={onClick}>
                {children}
            </a>
        );
    }

    return (
        <Link to={to} className={className} onClick={onClick}>
            {children}
        </Link>
    );
}
