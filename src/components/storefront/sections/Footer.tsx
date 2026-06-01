import {Globe} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';

import type {
    FooterConfig,
    FooterSocialLink,
    NavMenuItem,
    StorefrontBranding,
} from '@/types/storefront/storefrontTypes';

interface FooterProps {
    branding: StorefrontBranding;
    footer: FooterConfig;
}

// Inline SVG components for social brand icons — no third-party icon library needed.
type SvgIconProps = React.SVGProps<SVGSVGElement>;

const IconFacebook = (props: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.405 2.08-.43 1.588h-3.084v8.268a23.159 23.159 0 0 1-3.874-.271z"/>
    </svg>
);

const IconInstagram = (props: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
);

const IconLinkedIn = (props: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const IconXTwitter = (props: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
);

const IconYouTube = (props: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const IconTikTok = (props: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
    </svg>
);

type SocialIconComponent = (props: SvgIconProps) => React.ReactElement;

const socialIconMap: Record<string, SocialIconComponent> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    linkedin: IconLinkedIn,
    x: IconXTwitter,
    twitter: IconXTwitter,
    youtube: IconYouTube,
    tiktok: IconTikTok,
};

const isHttpUrl = (href: string) => /^https?:\/\//i.test(href);

/** Same-site absolute URLs use client-side navigation (no new tab). */
const sameOriginRouterPath = (href: string): string | null => {
    if (typeof window === 'undefined' || !isHttpUrl(href)) return null;
    try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) return null;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
};

/** Pathname only, for comparing with `location.pathname`. */
const footerLinkPathname = (item: NavMenuItem): string | null => {
    if (item.external) return null;
    const internalPath = sameOriginRouterPath(item.to);
    const path = internalPath ?? (isHttpUrl(item.to) ? null : item.to);
    if (path === null) return null;
    const pathname = path.split('?')[0].split('#')[0];
    if (!pathname) return '/';
    return pathname.length > 1 && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;
};

const normalizeLocationPathname = (pathname: string) =>
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

const IconGlobe = ({className}: SvgIconProps) => (
    <Globe className={className} aria-hidden="true"/>
);

const getSocialIcon = (iconKey: string): SocialIconComponent => {
    const normalized = iconKey.trim().toLowerCase();
    return socialIconMap[normalized] ?? IconGlobe;
};

const FooterLink = ({
                        item,
                        className,
                    }: {
    item: NavMenuItem;
    className: string;
}) => {
    const location = useLocation();
    const targetPathname = footerLinkPathname(item);

    const scrollToTopIfCurrentPage = () => {
        if (targetPathname === null) return;
        if (normalizeLocationPathname(location.pathname) !== targetPathname) return;
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    if (item.external) {
        return (
            <a
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {item.label}
            </a>
        );
    }

    const internalPath = sameOriginRouterPath(item.to);
    if (internalPath !== null) {
        return (
            <Link to={internalPath} className={className} onClick={scrollToTopIfCurrentPage}>
                {item.label}
            </Link>
        );
    }

    if (isHttpUrl(item.to)) {
        return (
            <a href={item.to} className={className}>
                {item.label}
            </a>
        );
    }

    return (
        <Link to={item.to} className={className} onClick={scrollToTopIfCurrentPage}>
            {item.label}
        </Link>
    );
};

const SocialLink = ({social}: { social: FooterSocialLink }) => {
    const Icon = getSocialIcon(social.icon);

    return (
        <a
            href={social.to}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            title={social.label}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--sf-nav-border) bg-(--sf-nav-bg) text-(--sf-nav-icon-text) transition-colors hover:text-[var(--sf-nav-text-hover)]"
        >
            <Icon className="h-4 w-4"/>
        </a>
    );
};

export const Footer = ({branding, footer}: FooterProps) => {
    const hasColumns = (footer.columns?.length ?? 0) > 0;
    const hasSocial = (footer.socialLinks?.length ?? 0) > 0;
    const hasLegal = (footer.legalLinks?.length ?? 0) > 0;
    const hasDescription = Boolean(footer.description);
    const callout = footer.footerCallout;

    return (
        <footer
            aria-label="Store footer"
            className="border-t border-(--sf-nav-border) bg-(--sf-nav-bg) text-(--sf-nav-text)"
        >
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4">
                        <div className="flex flex-nowrap items-center justify-between gap-3">
                            <div className="flex flex-nowrap items-center gap-3">
                                {branding.logo?.src ? (
                                    <img
                                        src={branding.logo.src}
                                        alt={branding.logo.alt || `${branding.name} logo`}
                                        width={branding.logo.width}
                                        height={branding.logo.height}
                                        className="h-8 w-auto object-contain"
                                    />
                                ) : null}
                                <p className="whitespace-nowrap text-base font-semibold tracking-tight">{branding.name}</p>
                            </div>

                            {hasSocial ? (
                                <div className="flex flex-wrap gap-2 lg:hidden" aria-label="Social links">
                                    {footer.socialLinks?.map((social) => (
                                        <SocialLink key={social.id} social={social}/>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        {hasDescription ? (
                            <p className="mt-3 max-w-sm text-sm leading-5 text-(--sf-nav-icon-text)">
                                {footer.description}
                            </p>
                        ) : null}

                        {callout ? (
                            <div className="mt-4 rounded-xl border border-(--sf-nav-border) bg-black/15 p-4 text-xs text-(--sf-nav-icon-text)">
                                <p className="font-semibold uppercase tracking-[0.12em] text-(--sf-nav-text)">
                                    {callout.heading}
                                </p>
                                <p className="mt-2 leading-5">{callout.body}</p>
                            </div>
                        ) : null}

                        {hasSocial ? (
                            <div className="mt-4 hidden flex-wrap gap-2 lg:flex" aria-label="Social links">
                                {footer.socialLinks?.map((social) => (
                                    <SocialLink key={social.id} social={social}/>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {hasColumns ? (
                        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-8 lg:grid-cols-3">
                            {footer.columns?.map((column) => (
                                <div key={column.heading}>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider">
                                        {column.heading}
                                    </h3>
                                    <ul className="mt-3 space-y-2">
                                        {column.links.map((link) => (
                                            <li key={link.id}>
                                                <FooterLink
                                                    item={link}
                                                    className="text-sm text-(--sf-nav-icon-text) underline-offset-4 transition-colors hover:text-(--sf-nav-text-hover) hover:underline"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div
                    className="mt-6 flex flex-col gap-3 border-t border-(--sf-nav-border) pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-(--sf-nav-icon-text)">
                        &copy; {new Date().getFullYear()} {branding.name}
                    </p>

                    {hasLegal ? (
                        <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            {footer.legalLinks?.map((link) => (
                                <FooterLink
                                    key={link.id}
                                    item={link}
                                    className="text-(--sf-nav-icon-text) transition-colors hover:text-(--sf-nav-text-hover)"
                                />
                            ))}
                        </nav>
                    ) : null}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
