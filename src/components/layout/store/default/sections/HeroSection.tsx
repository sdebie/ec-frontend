import { ReactNode } from 'react'
import { useStorefrontTheme } from '@/components/layout/store/default/theme'

interface HeroSectionProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  backgroundOverlay?: boolean
  ctaButton?: {
    label: string
    href: string
    onClick?: () => void
  }
  ctaButtonSecondary?: {
    label: string
    href: string
    onClick?: () => void
  }
  children?: ReactNode
  height?: 'small' | 'medium' | 'large'
}

/**
 * HeroSection
 * Full-width hero banner with customizable background, title, and CTA
 * Used at the top of pages for maximum impact
 */
export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  backgroundOverlay = true,
  ctaButton,
  ctaButtonSecondary,
  children,
  height = 'large',
}: HeroSectionProps) {
  const { config } = useStorefrontTheme()

  const heightClass = {
    small: 'h-64',
    medium: 'h-96',
    large: 'h-[32rem]',
  }[height]

  return (
    <section
      className={`relative w-full ${heightClass} flex items-center justify-center overflow-hidden`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      {backgroundOverlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          style={{
            color: backgroundImage ? '#ffffff' : 'var(--storefront-color-primary)',
            fontFamily: 'var(--storefront-font-heading)',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-lg md:text-xl mb-8"
            style={{
              color: backgroundImage ? '#ffffff' : 'var(--storefront-color-text-secondary)',
            }}
          >
            {subtitle}
          </p>
        )}

        {children}

        {/* CTA Buttons */}
        {(ctaButton || ctaButtonSecondary) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {ctaButton && (
              <a
                href={ctaButton.href}
                onClick={(e) => {
                  if (ctaButton.onClick) {
                    e.preventDefault()
                    ctaButton.onClick()
                  }
                }}
                className="px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--storefront-color-button-primary)',
                  color: 'var(--storefront-color-button-primary-text)',
                }}
              >
                {ctaButton.label}
              </a>
            )}
            {ctaButtonSecondary && (
              <a
                href={ctaButtonSecondary.href}
                onClick={(e) => {
                  if (ctaButtonSecondary.onClick) {
                    e.preventDefault()
                    ctaButtonSecondary.onClick()
                  }
                }}
                className="px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg border"
                style={{
                  backgroundColor: 'var(--storefront-color-button-secondary)',
                  color: 'var(--storefront-color-button-secondary-text)',
                  borderColor: 'var(--storefront-color-border)',
                }}
              >
                {ctaButtonSecondary.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection

