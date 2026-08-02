import { Phone } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { waMeUrl } from '@/shared/utils/waMeUrl'
import { IconWhatsApp, socialIconMap } from '@/shared/ui/icons'
import type { FooterSocialLink } from '@/shared/types/StorefrontConfig'

/** Focus recipe for banner links — offset colour is the banner background. */
const BANNER_FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--banner-bg)] rounded-sm'

export function AnnouncementBanner() {
  const config = useStorefrontConfig()
  const ann = config.header?.announcement

  if (!ann?.enabled) return null

  const hasMessage = Boolean(ann.text)

  // Contact slot data check
  const contact = config.contact
  const hasContactData =
    ann.showContact === true &&
    Boolean(contact?.phones?.[0] || contact?.whatsapp)

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
        {/* Contact slot — left, md+ only */}
        {hasContactData ? (
          <div className="hidden md:flex items-center gap-3 justify-start">
            {contact?.phones?.[0] && (
              <a
                href={`tel:${contact.phones[0]}`}
                className={`inline-flex items-center gap-1 hover:underline transition-colors ${BANNER_FOCUS}`}
              >
                <Phone size={14} aria-hidden="true" />
                <span>{contact.phones[0]}</span>
              </a>
            )}
            {contact?.whatsapp && (
              <a
                href={waMeUrl(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 hover:underline transition-colors ${BANNER_FOCUS}`}
              >
                <IconWhatsApp width={14} height={14} aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            )}
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
                  className={`hover:underline transition-colors ${BANNER_FOCUS}`}
                >
                  <IconComponent width={16} height={16} aria-hidden="true" />
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
