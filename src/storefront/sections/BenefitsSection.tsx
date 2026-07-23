import { Truck, Tag, Users, ShieldCheck, Award, Package, Clock, Headphones } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import type { BenefitsSectionConfig } from '@/shared/types/StorefrontConfig'

import { Section, SectionHeading } from './shared'

/**
 * Local named-icon map for BenefitsSection.
 * Registered icon names (these are the vocabulary for seed `item.icon` values):
 *   truck, tag, users, shield-check, award, package, clock, headphones
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
}

/**
 * Item count is seed-driven and varies per client; the desktop column count
 * must divide evenly where possible so no card is orphaned on its own row
 * (4 items in a 3-column grid leaves a stranded card).
 */
function gridColsClass(count: number): string {
  if (count <= 2) return 'sm:grid-cols-2'
  if (count % 4 === 0) return 'sm:grid-cols-2 lg:grid-cols-4'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

export function BenefitsSection({ section }: { section: BenefitsSectionConfig }) {
  const { title, eyebrow, items } = section.props

  return (
    <Section>
      <SectionHeading title={title} eyebrow={eyebrow} />
      <div className={`mt-6 grid gap-4 ${gridColsClass(items.length)}`}>
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
              className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 shadow-(--sf-shadow-sm)"
            >
              {IconComponent && (
                <IconComponent
                  className="mb-2 h-5 w-5 text-(--sf-accent)"
                  aria-hidden="true"
                />
              )}
              <h3 className="font-medium text-(--sf-text)">{item.title}</h3>
              <p className="mt-2 text-sm text-(--sf-muted-text)">{item.description}</p>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
