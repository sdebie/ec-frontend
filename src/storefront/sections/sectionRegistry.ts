import type { SectionConfig } from '@/shared/types/StorefrontConfig'
import { HeroSection } from './HeroSection'
import { FeaturedProductsSection } from './FeaturedProductsSection'
import { CategoryPreviewSection } from './CategoryPreviewSection'
import { TestimonialsSection } from './TestimonialsSection'
import { BenefitsSection } from './BenefitsSection'
import { CtaSection } from './CtaSection'
import { NewsletterSection } from './NewsletterSection'
import { PromoGridSection } from './PromoGridSection'

type AnySectionComponent = React.ComponentType<{ section: SectionConfig }>

export const sectionRegistry: Partial<Record<SectionConfig['type'], AnySectionComponent>> = {
  'hero': HeroSection as AnySectionComponent,
  'featured-products': FeaturedProductsSection as AnySectionComponent,
  'category-preview': CategoryPreviewSection as AnySectionComponent,
  'testimonials': TestimonialsSection as AnySectionComponent,
  'benefits': BenefitsSection as AnySectionComponent,
  'cta': CtaSection as AnySectionComponent,
  'newsletter': NewsletterSection as AnySectionComponent,
  'promo-grid': PromoGridSection as AnySectionComponent,
}
