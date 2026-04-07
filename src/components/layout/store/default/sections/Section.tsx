import { ReactNode } from 'react'
import { useStorefrontTheme } from '@/components/layout/store/default/theme'

interface SectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  backgroundColor?: 'surface' | 'background' | 'custom'
  customBackgroundColor?: string
  paddingSize?: 'small' | 'medium' | 'large'
  className?: string
}

/**
 * Section
 * Generic reusable section container
 * Provides consistent spacing, background, and title styling
 */
export function Section({
  title,
  subtitle,
  children,
  backgroundColor = 'surface',
  customBackgroundColor,
  paddingSize = 'medium',
  className = '',
}: SectionProps) {
  const paddingClass = {
    small: 'py-8 px-4',
    medium: 'py-12 px-4',
    large: 'py-16 px-4',
  }[paddingSize]

  const bgColor =
    customBackgroundColor ||
    (backgroundColor === 'background' ? 'var(--storefront-color-background)' : 'var(--storefront-color-surface)')

  return (
    <section
      className={`w-full ${paddingClass} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto" style={{
        maxWidth: 'var(--storefront-spacing-container-max-width, 1280px)',
      }}>
        {/* Title */}
        {title && (
          <div className="mb-8 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                color: 'var(--storefront-color-text-primary)',
                fontFamily: 'var(--storefront-font-heading)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-lg"
                style={{
                  color: 'var(--storefront-color-text-secondary)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </section>
  )
}

export default Section

