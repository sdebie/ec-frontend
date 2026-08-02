import { Truck, Tag, Users, ShieldCheck, Award, Package, Clock, Headphones, HardHat, SprayCan, Stethoscope, Factory, UtensilsCrossed, House } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

/**
 * Shared named-icon registry for storefront sections. These names are the
 * vocabulary for seed icon props (`BenefitItem.icon`, `SectionHeading` icon,
 * …) — seed data supplies a name, never a component.
 *
 * Unregistered names should produce a dev-only console.warn at the callsite
 * and render no icon slot.
 */
export const sectionIconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
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
  utensils: UtensilsCrossed,
  house: House,
}

export function resolveSectionIcon(
  name: string | undefined,
  caller: string,
): ComponentType<SVGProps<SVGSVGElement>> | undefined {
  if (!name) return undefined
  const IconComponent = sectionIconMap[name]
  if (!IconComponent && import.meta.env.DEV) {
    console.warn(
      `[${caller}] Unknown icon name: "${name}". Registered names: ${Object.keys(sectionIconMap).join(', ')}`
    )
  }
  return IconComponent
}
