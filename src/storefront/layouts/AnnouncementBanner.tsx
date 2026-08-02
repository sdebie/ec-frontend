import { Mail, Phone } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { waMeUrl } from '@/shared/utils/waMeUrl'
import { IconWhatsApp, socialIconMap } from '@/shared/ui/icons'
import type { FooterSocialLink } from '@/shared/types/StorefrontConfig'

/**
 * Focus recipe for banner links — offset colour is the banner background.
 * Carries NO border-radius: each consumer sets its own (text links are
 * `rounded-sm`, social chips `rounded-full`), and a radius baked in here would
 * collide with theirs — same specificity, so whichever Tailwind emits last wins.
 */
const BANNER_FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--banner-bg)]'

export function AnnouncementBanner() {
  const config = useStorefrontConfig()
  const ann = config.header?.announcement

  if (!ann?.enabled) return null

  const hasMessage = Boolean(ann.text)

  // Contact slot data check
  const contact = config.contact
  const bannerEmail = contact?.enquiryEmail || contact?.emails?.[0]
  const hasContactData =
    ann.showContact === true &&
    Boolean(contact?.phones?.[0] || contact?.whatsapp || bannerEmail)

  // Social slot data check
  const socialLinks = config.footer?.socialLinks
  const resolvedSocialLinks = ann.showSocial === true
    ? (socialLinks ?? []).filter((link: FooterSocialLink) => socialIconMap[link.icon])
    : []
  const hasSocialData = resolvedSocialLinks.length > 0

  // New guard: render when enabled AND (message OR contact slot has data OR social slot has data)
  if (!hasMessage && !hasContactData && !hasSocialData) return null

  const bgColor = ann.backgroundColor || 'var(--sf-panel)'
  const textColor = ann.textColor || 'var(--sf-text)'

  // Built as data so the pipe separators can sit BETWEEN entries regardless of
  // which ones this client has — a per-entry border/prefix would render a
  // stray rule whenever the first entry is absent.
  const contactEntries: Array<{
    key: string
    href: string
    label: string
    icon: React.ReactNode
    external?: boolean
  }> = []

  if (contact?.phones?.[0]) {
    contactEntries.push({
      key: 'phone',
      href: `tel:${contact.phones[0]}`,
      label: contact.phones[0],
      icon: <Phone size={14} aria-hidden="true" />,
    })
  }
  if (contact?.whatsapp) {
    contactEntries.push({
      key: 'whatsapp',
      href: waMeUrl(contact.whatsapp),
      label: 'WhatsApp',
      icon: <IconWhatsApp width={14} height={14} aria-hidden="true" />,
      external: true,
    })
  }
  if (bannerEmail) {
    contactEntries.push({
      key: 'email',
      href: `mailto:${bannerEmail}`,
      label: bannerEmail,
      icon: <Mail size={14} aria-hidden="true" />,
    })
  }

  return (
    <div
      role="banner"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        // expose as CSS variable for focus ring offset
        '--banner-bg': bgColor,
      } as React.CSSProperties}
      // Req 4.6: below `md` the bar shows the message ALONE — both utility slots
      // are `hidden md:flex`, so with no message every child is hidden and the
      // wrapper's own `py-2` would leave a bare coloured strip. Hide the wrapper
      // itself in that case (complete literal class strings — an interpolated
      // fragment never reaches the Tailwind scanner).
      className={
        hasMessage
          ? 'w-full py-2 px-4 text-sm'
          : 'hidden md:block w-full py-2 px-4 text-sm'
      }
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center">
        {/* Contact slot — left, md+ only. Entries are pipe-separated; the rule is
            a decorative sibling (not a border) so it never renders leading or
            trailing, whichever entries the client actually has. It inherits the
            banner's own text colour at reduced opacity — no palette literal. */}
        {hasContactData ? (
          <div className="hidden md:flex items-center gap-3 justify-start">
            {contactEntries.map((entry, index) => (
              <span key={entry.key} className="inline-flex items-center gap-3">
                {index > 0 && (
                  <span aria-hidden="true" className="opacity-40 select-none">
                    |
                  </span>
                )}
                <a
                  href={entry.href}
                  {...(entry.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className={`inline-flex items-center gap-1 rounded-sm hover:underline transition-colors ${BANNER_FOCUS}`}
                >
                  {entry.icon}
                  <span>{entry.label}</span>
                </a>
              </span>
            ))}
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Message — centre */}
        {hasMessage ? (
          <div className="text-center">
            {ann.text}
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Social slot — right, md+ only */}
        {hasSocialData ? (
          <div className="hidden md:flex items-center gap-2 justify-end">
            {resolvedSocialLinks.map((link: FooterSocialLink) => {
              const IconComponent = socialIconMap[link.icon]
              return (
                <a
                  key={link.id}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  // Ring and hover wash are both `currentColor`, so they follow
                  // the banner's configured text colour instead of a literal.
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/40 transition-colors hover:border-current/70 hover:bg-current/15 ${BANNER_FOCUS}`}
                >
                  <IconComponent width={15} height={15} aria-hidden="true" />
                </a>
              )
            })}
          </div>
        ) : (
          <div className="hidden md:block" />
        )}
      </div>
    </div>
  )
}
