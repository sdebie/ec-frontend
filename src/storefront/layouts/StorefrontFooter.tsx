import { Globe, Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import { waMeUrl } from '@/shared/utils/waMeUrl'
import { socialIconMap } from '@/shared/ui/icons'
import { SF_FOCUS_RING, SOCIAL_CHIP_CLASS } from '@/storefront/sections/shared/focusRing'
import type { ContactConfig, FooterColumn, FooterLegalLink, FooterSocialLink } from '@/shared/types/StorefrontConfig'

function SocialIcon({ link }: { link: FooterSocialLink }) {
  const IconComponent = socialIconMap[link.icon] ?? null

  return (
    <a
      href={link.to}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      title={link.label}
      className={`${SOCIAL_CHIP_CLASS} h-9 w-9 ${SF_FOCUS_RING.nav}`}
      style={{ color: 'var(--sf-nav-icon-text)' }}
    >
      {IconComponent ? (
        <IconComponent width={18} height={18} aria-hidden="true" />
      ) : (
        <Globe size={18} aria-hidden="true" />
      )}
    </a>
  )
}

/** Trims, drops blanks, removes duplicates — order preserved. */
function unique(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/**
 * True when there is at least one way to REACH the client. Address and hours
 * deliberately do not count: they live in the brand column now, so a client
 * with only a location would otherwise get a "Get in touch" column with an
 * empty body under it.
 */
function hasFooterChannels(contact: ContactConfig | undefined): boolean {
  if (!contact) return false
  return (
    unique([...(contact.phones ?? []), contact.landline]).length > 0 ||
    !!contact.whatsapp?.trim() ||
    unique([...(contact.emails ?? []), contact.enquiryEmail]).length > 0
  )
}

/**
 * Heading for the contact column. Matches `FooterColumn`'s heading treatment so
 * contact reads as one of the footer's columns rather than loose text under the
 * brand blurb — it is grouped, labelled and scannable like every other column.
 */
const CONTACT_HEADING = 'Get in touch'

/**
 * Where the business is and when it is open. Lives in the BRAND column, above
 * the social icons (owner directive 2026-08-02): it describes the company
 * rather than offering a way to reach it, so it belongs with the identity
 * block, not among the actionable channels.
 */
export function FooterLocationBlock({ contact }: { contact: ContactConfig }) {
  const address = contact.physicalAddress?.trim()
  const hours = contact.businessHours?.trim()

  if (!address && !hours) return null

  return (
    <div className="mt-4 space-y-2 text-sm" data-testid="footer-location-block">
      {hours && (
        <div className="flex items-center gap-2">
          <Clock size={16} aria-hidden="true" className="shrink-0 opacity-70" />
          <span>{hours}</span>
        </div>
      )}
      {address && (
        <div className="flex items-start gap-2">
          <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 opacity-70" />
          <span>{address}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Every way to reach the client: all mobile numbers, the landline, WhatsApp and
 * all e-mail addresses.
 *
 * Both lists are de-duplicated — the live contact record repeats the same
 * address three times, and printing it three times would read as a mistake
 * rather than as three ways to get in touch.
 */
export function FooterContactBlock({ contact }: { contact: ContactConfig }) {
  const numbers = unique([...(contact.phones ?? []), contact.landline])
  const whatsapp = contact.whatsapp?.trim()
  const emails = unique([...(contact.emails ?? []), contact.enquiryEmail])

  return (
    <div className="mb-4 space-y-2 text-sm" data-testid="footer-contact-block">
      {numbers.map((number) => (
        <div key={number} className="flex items-center gap-2">
          <Phone size={16} aria-hidden="true" className="shrink-0 opacity-70" />
          <a
            href={`tel:${number.replace(/\s+/g, '')}`}
            className={`transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
          >
            {number}
          </a>
        </div>
      ))}
      {whatsapp && (
        <div className="flex items-center gap-2">
          <MessageCircle size={16} aria-hidden="true" className="shrink-0 opacity-70" />
          <a
            href={waMeUrl(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
          >
            WhatsApp
          </a>
        </div>
      )}
      {emails.map((email) => (
        <div key={email} className="flex items-center gap-2">
          <Mail size={16} aria-hidden="true" className="shrink-0 opacity-70" />
          <a
            href={`mailto:${email}`}
            className={`break-all transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
          >
            {email}
          </a>
        </div>
      ))}
    </div>
  )
}

// Desktop column count follows how many columns actually render (seeded columns
// plus the contact column when the client has contact details). Complete literal
// class strings — Tailwind scans source text, so `lg:grid-cols-${n}` emits nothing.
const FOOTER_COLS_CLASS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

function NavigationColumns({ columns, leading }: { columns: FooterColumn[]; leading?: React.ReactNode }) {
  const count = columns.length + (leading ? 1 : 0)
  const colsClass = FOOTER_COLS_CLASS[Math.min(count, 4)] ?? FOOTER_COLS_CLASS[4]

  return (
    <div className={`grid grid-cols-2 gap-8 ${colsClass}`}>
      {leading}
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
                    className={`text-sm transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className={`text-sm transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
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
      {/* No opening rule (owner directive 2026-08-03): the footer runs straight
          on from the dark band above it. The top padding carries the separation
          the removed seam used to provide, so the brand block sits where it
          always has rather than crowding the band. */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14">
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

            {/* Social sits under the brand identity, not appended to a contact list. */}
            {footer.socialLinks && footer.socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {footer.socialLinks.map((link) => (
                  <SocialIcon key={link.id} link={link} />
                ))}
              </div>
            )}

            {/* When we're open and where we are — company facts, below the social
                row (owner directive 2026-08-03). They describe the business
                rather than offering a way to reach it, so they stay out of the
                "Get in touch" column. */}
            {config.contact && <FooterLocationBlock contact={config.contact} />}
          </div>

          {/* Navigation columns + contact as a peer column */}
          {(footer.columns?.length || hasFooterChannels(config.contact)) && (
            <div className="lg:col-span-8">
              <NavigationColumns
                columns={footer.columns ?? []}
                leading={
                  hasFooterChannels(config.contact) ? (
                    <div>
                      <h3 className="font-semibold mb-3">{CONTACT_HEADING}</h3>
                      <FooterContactBlock contact={config.contact!} />
                    </div>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Bottom bar — its rule tracks the content container's width (owner
            directive 2026-08-03), so it starts and ends with the columns above
            it rather than running to the viewport edges. */}
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
                    className={`text-sm transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.id}
                    to={link.to}
                    className={`text-sm transition-colors hover:[color:var(--sf-nav-text-hover)] ${SF_FOCUS_RING.nav} rounded-sm`}
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
