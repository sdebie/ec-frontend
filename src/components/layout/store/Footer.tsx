import {Link} from 'react-router-dom';
import type {IconType} from 'react-icons';
import {FaFacebookF, FaGlobe, FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter, FaYoutube,} from 'react-icons/fa6';
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

const socialIconMap: Record<string, IconType> = {
    facebook: FaFacebookF,
    instagram: FaInstagram,
    linkedin: FaLinkedinIn,
    x: FaXTwitter,
    twitter: FaXTwitter,
    youtube: FaYoutube,
    tiktok: FaTiktok,
};

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

const getSocialIcon = (iconKey: string): IconType => {
    const normalized = iconKey.trim().toLowerCase();
    return socialIconMap[normalized] ?? FaGlobe;
};

const FooterLink = ({
                        item,
                        className,
                    }: {
    item: NavMenuItem;
    className: string;
}) => {
    const external = item.external || isExternalHref(item.to);

    if (external) {
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

    return (
        <Link to={item.to} className={className}>
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--sf-nav-border) bg-(--sf-nav-bg) text-(--sf-nav-icon-text) transition-colors hover:text-[var(--sf-nav-text-hover)]"
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

    return (
        <footer
            aria-label="Store footer"
            className="mt-16 border-t border-(--sf-nav-border) bg-(--sf-nav-bg) text-(--sf-nav-text)"
        >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-3">
                            {branding.logo?.src ? (
                                <img
                                    src={branding.logo.src}
                                    alt={branding.logo.alt || `${branding.name} logo`}
                                    width={branding.logo.width}
                                    height={branding.logo.height}
                                    className="h-10 w-auto object-contain"
                                    style={{
                                        width: branding.logo.width,
                                        height: branding.logo.height,
                                    }}
                                />
                            ) : null}
                            <p className="text-lg font-semibold tracking-tight">{branding.name}</p>
                        </div>

                        {hasDescription ? (
                            <p className="mt-4 max-w-sm text-sm leading-6 text-(--sf-nav-icon-text)">
                                {footer.description}
                            </p>
                        ) : null}

                        <div className="mt-4 rounded-xl border border-(--sf-nav-border) bg-black/15 p-4 text-xs text-(--sf-nav-icon-text)">
                            <p className="font-semibold uppercase tracking-[0.12em] text-(--sf-nav-text)">Bulk orders & tenders</p>
                            <p className="mt-2 leading-5">
                                Need recurring supply, large quantities, or tender support? Our team can assist quickly.
                            </p>
                        </div>

                        {hasSocial ? (
                            <div className="mt-6 flex flex-wrap gap-3" aria-label="Social links">
                                {footer.socialLinks?.map((social) => (
                                    <SocialLink key={social.id} social={social}/>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {hasColumns ? (
                        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
                            {footer.columns?.map((column) => (
                                <div key={column.heading}>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider">
                                        {column.heading}
                                    </h3>
                                    <ul className="mt-4 space-y-3">
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
                    className="mt-10 flex flex-col gap-4 border-t border-(--sf-nav-border) pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
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
