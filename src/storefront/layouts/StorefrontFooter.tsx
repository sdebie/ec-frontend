import { Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import {
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconXTwitter,
  IconYouTube,
  IconTikTok,
} from '@/shared/ui/icons'
import type { FooterColumn, FooterLegalLink, FooterSocialLink } from '@/shared/types/StorefrontConfig'

const socialIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  linkedin: IconLinkedIn,
  x: IconXTwitter,
  twitter: IconXTwitter,
  youtube: IconYouTube,
  tiktok: IconTikTok,
}

function SocialIcon({ link }: { link: FooterSocialLink }) {
  const IconComponent = socialIconMap[link.icon] ?? null

  return (
    <a
      href={link.to}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      className="transition-colors"
      style={{ color: 'var(--sf-nav-icon-text)' }}
    >
      {IconComponent ? (
        <IconComponent width={20} height={20} aria-hidden="true" />
      ) : (
        <Globe size={20} aria-hidden="true" />
      )}
    </a>
  )
}

function NavigationColumns({ columns }: { columns: FooterColumn[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
      {columns.map((column) => (
        <div key={column.heading}>
          <h3 className="font-semibold mb-3">{column.heading}</h3>
          <ul className="space-y-2">
            {column.links.map((link) => (
              <li key={link.id}>
                {link.external ? (
                  <a
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:[color:var(--sf-nav-text-hover)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm transition-colors hover:[color:var(--sf-nav-text-hover)]"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function StorefrontFooter() {
  const config = useStorefrontConfig()

  if (!config.footer) return null

  const { footer } = config
  const branding = config.branding ?? { name: config.clientName }

  return (
    <footer style={{ backgroundColor: 'var(--sf-nav-background)', color: 'var(--sf-nav-text)' }}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            {branding.logo && (
              <img
                src={resolveImageUrl(branding.logo.src) ?? branding.logo.src}
                alt={branding.logo.alt}
                width={branding.logo.width}
                height={branding.logo.height}
                className="mb-4"
              />
            )}

            {branding.name && (
              <h2 className="mb-2 text-lg font-semibold">{branding.name}</h2>
            )}

            {footer.description && (
              <p className="mb-4 text-sm opacity-80">{footer.description}</p>
            )}

            {footer.footerCallout && (
              <div className="mb-4 rounded-md p-4" style={{ backgroundColor: 'var(--sf-nav-border)', color: 'var(--sf-nav-text)' }}>
                <h3 className="font-semibold">{footer.footerCallout.heading}</h3>
                <p className="mt-1 text-sm">{footer.footerCallout.body}</p>
              </div>
            )}

            {footer.socialLinks && footer.socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {footer.socialLinks.map((link) => (
                  <SocialIcon key={link.id} link={link} />
                ))}
              </div>
            )}
          </div>

          {/* Navigation columns */}
          {footer.columns && footer.columns.length > 0 && (
            <div className="lg:col-span-8">
              <NavigationColumns columns={footer.columns} />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center gap-4 pt-8 lg:flex-row lg:justify-between"
          style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--sf-nav-border)' }}
        >
          <p className="text-sm">
            © {new Date().getFullYear()} {branding.name || config.clientName}
          </p>

          {footer.legalLinks && footer.legalLinks.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {footer.legalLinks.map((link: FooterLegalLink) =>
                link.external ? (
                  <a
                    key={link.id}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:[color:var(--sf-nav-text-hover)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.id}
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm transition-colors hover:[color:var(--sf-nav-text-hover)]"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
