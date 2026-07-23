import { Truck, Tag, Users, ShieldCheck, Award, Package, Clock, Headphones, HardHat, SprayCan, Stethoscope, Factory } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router-dom'

import type { BenefitsSectionConfig } from '@/shared/types/StorefrontConfig'

import { Section, SectionHeading } from './shared'

/**
 * Local named-icon map for BenefitsSection.
 * Registered icon names (these are the vocabulary for seed `item.icon` values):
 *   truck, tag, users, shield-check, award, package, clock, headphones,
 *   hard-hat, spray-can, stethoscope, factory
 *
 * Unregistered names produce a dev-only console.warn and render no icon slot.
 */
const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  truck: Truck,
  tag: Tag,
  users: Users,
  'shield-check': ShieldCheck,
  award: Award,
  package: Package,
  clock: Clock,
  headphones: Headphones,
  'hard-hat': HardHat,
  'spray-can': SprayCan,
  stethoscope: Stethoscope,
  factory: Factory,
}

const explicitColsClass: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Item count is seed-driven and varies per client; the desktop column count
 * must divide evenly where possible so no card is orphaned on its own row
 * (4 items in a 3-column grid leaves a stranded card). An explicit `columns`
 * seed prop overrides the derivation.
 */
function gridColsClass(count: number, columns?: 2 | 3 | 4): string {
  if (columns) return explicitColsClass[columns]
  if (count <= 2) return 'sm:grid-cols-2'
  if (count % 4 === 0) return 'sm:grid-cols-2 lg:grid-cols-4'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

export function BenefitsSection({ section }: { section: BenefitsSectionConfig }) {
  const { title, eyebrow, variant, iconPlacement = 'top', columns, items, footnote } = section.props

  return (
    <Section variant={variant}>
      <SectionHeading title={title} eyebrow={eyebrow} />
      <div className={`mt-6 grid gap-4 ${gridColsClass(items.length, columns)}`}>
        {items.map((item) => {
          const IconComponent = item.icon ? iconMap[item.icon] : undefined

          if (item.icon && !IconComponent && import.meta.env.DEV) {
            console.warn(
              `[BenefitsSection] Unknown icon name: "${item.icon}". Registered names: ${Object.keys(iconMap).join(', ')}`
            )
          }

          return (
            <article
              key={item.title}
              className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 shadow-(--sf-shadow-sm) in-data-[variant=dark]:border-white/10 in-data-[variant=dark]:bg-white/5"
            >
              {iconPlacement === 'inline' ? (
                <div className="flex items-center gap-2">
                  {IconComponent && (
                    <IconComponent
                      className="h-5 w-5 shrink-0 text-(--sf-accent)"
                      aria-hidden="true"
                    />
                  )}
                  <h3 className="font-medium text-(--sf-text) in-data-[variant=dark]:text-inherit">{item.title}</h3>
                </div>
              ) : (
                <>
                  {IconComponent && (
                    <IconComponent
                      className="mb-2 h-5 w-5 text-(--sf-accent)"
                      aria-hidden="true"
                    />
                  )}
                  <h3 className="font-medium text-(--sf-text) in-data-[variant=dark]:text-inherit">{item.title}</h3>
                </>
              )}
              <p className="mt-2 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">{item.description}</p>
            </article>
          )
        })}
      </div>
      {footnote && footnote.length > 0 && (
        <p className="mt-6 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">
          {footnote.map((segment, index) =>
            segment.to ? (
              <Link
                key={index}
                to={segment.to}
                className="font-medium text-(--sf-accent) hover:underline in-data-[variant=dark]:text-white in-data-[variant=dark]:underline"
              >
                {segment.text}
              </Link>
            ) : (
              <span key={index}>{segment.text}</span>
            )
          )}
        </p>
      )}
    </Section>
  )
}
