import { Phone, MessageCircle } from 'lucide-react'
import { ACCENT_LINK_HOVER, SF_FOCUS_RING_PAGE } from '@/storefront/sections/shared'
import { waMeUrl } from '@/shared/utils/waMeUrl'
import type { QuoteConfig, ContactConfig } from '@/shared/types/StorefrontConfig'

interface QuoteReassurancePanelProps {
  quote: QuoteConfig
  contact?: ContactConfig
}

/**
 * QuoteReassurancePanel — renders numbered steps, SLA/validity lines, and a
 * contact escape hatch when config data is present. Rendered alongside the
 * quote form when `StorefrontConfig.quote` has any field set.
 */
export function QuoteReassurancePanel({ quote, contact }: QuoteReassurancePanelProps) {
  const { steps, slaText, validityText } = quote
  const hasSteps = steps && steps.length > 0
  const hasSla = !!slaText
  const hasValidity = !!validityText

  const phone = contact?.phones?.[0]
  const whatsapp = contact?.whatsapp
  const hasEscapeHatch = !!phone || !!whatsapp

  return (
    <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6">
      <h3 className="text-base font-semibold text-(--sf-text)">How it works</h3>

      {hasSteps && (
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-(--sf-text)">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--sf-accent)/10 text-xs font-semibold text-(--sf-accent)">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {(hasSla || hasValidity) && (
        <div className="mt-5 space-y-2 border-t border-(--sf-border) pt-4">
          {hasSla && (
            <p className="text-sm text-(--sf-text)">
              <span className="font-medium">Turnaround:</span> {slaText}
            </p>
          )}
          {hasValidity && (
            <p className="text-sm text-(--sf-text)">
              <span className="font-medium">Validity:</span> {validityText}
            </p>
          )}
        </div>
      )}

      {hasEscapeHatch && (
        <div className="mt-5 border-t border-(--sf-border) pt-4">
          <p className="text-sm font-medium text-(--sf-text)">Deadline tighter?</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {phone && (
              <a
                href={`tel:${phone}`}
                className={`inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-(--sf-accent) transition-colors ${ACCENT_LINK_HOVER} ${SF_FOCUS_RING_PAGE}`}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call us
              </a>
            )}
            {whatsapp && (
              <a
                href={waMeUrl(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-(--sf-accent) transition-colors ${ACCENT_LINK_HOVER} ${SF_FOCUS_RING_PAGE}`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
