import {Globe} from 'lucide-react';
import {useLocation} from 'react-router-dom';
import {
    IconFacebook,
    IconInstagram,
    IconLinkedIn,
    IconTikTok,
    IconXTwitter,
    IconYouTube,
} from '@/components/icons';
import {StorefrontNavLink} from '@/components/shared/navigation';
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

type SvgIconProps = React.SVGProps<SVGSVGElement>;
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

const IconGlobe = ({className}: SvgIconProps) => (
    <Globe className={className} aria-hidden="true"/>
);

const getSocialIcon = (iconKey: string): SocialIconComponent => {
    const normalized = iconKey.trim().toLowerCase();
    return socialIconMap[normalized] ?? IconGlobe;
};

/** Wraps StorefrontNavLink with scroll-to-top behaviour for same-page links. */
const FooterLink = ({item, className}: { item: NavMenuItem; className: string }) => {
    const location = useLocation();

    const handleClick = () => {
        if (item.external) return;
        // Scroll to top when the link points to the page the user is already on
        const isRelative = !/^https?:\/\//i.test(item.to);
        const targetPath = isRelative ? item.to.split('?')[0].split('#')[0] : null;
        const currentPath = location.pathname.replace(/\/$/, '') || '/';
        const normalTarget = (targetPath ?? '').replace(/\/$/, '') || '/';
        if (targetPath !== null && currentPath === normalTarget) {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    return (
        <StorefrontNavLink
            to={item.to}
            external={item.external}
            className={className}
            onClick={handleClick}
        >
            {item.label}
        </StorefrontNavLink>
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
