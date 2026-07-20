import type {SectionConfig} from '@/shared/types/StorefrontConfig'
import {HeroSection} from './HeroSection'
import {FeaturedProductsSection} from './FeaturedProductsSection'
import {CategoryPreviewSection} from './CategoryPreviewSection'
import {TestimonialsSection} from './TestimonialsSection'
import {BenefitsSection} from './BenefitsSection'
import {CtaSection} from './CtaSection'
import {NewsletterSection} from './NewsletterSection'
import {PromoGridSection} from './PromoGridSection'
import {AccreditorsSection} from './AccreditorsSection'
import {BrandsSection} from './BrandsSection'
import {CategoryShowcaseSection} from './CategoryShowcaseSection'
import {SaleProductsSection} from './SaleProductsSection'
import {ContentSplitSection} from './ContentSplitSection'
import {StatsSection} from './StatsSection'

type AnySectionComponent = React.ComponentType<{ section: SectionConfig }>

/*
  Two deliberate categories of a section:

  1. Config-embedded — all content lives in the section's `props` in the
     storefront.home_sections JSON (hero, benefits, cta, testimonials,
     accreditors, stats, content-split). Use for content with no DB entity of its own.

  2. DB-entity-backed — the section's props carry only display hints
     (heading, limit, categorySlug); the content is fetched live from its
     own table via existing hooks (featured-products, brands,
     category-showcase). Use whenever the data already has a table —
     never duplicate DB entities into the config JSON.

  When adding a section type, decide its category explicitly.
*/
export const sectionRegistry: Partial<Record<SectionConfig['type'], AnySectionComponent>> = {
    'hero': HeroSection as AnySectionComponent,
    'featured-products': FeaturedProductsSection as AnySectionComponent,
    'category-preview': CategoryPreviewSection as AnySectionComponent,
    'testimonials': TestimonialsSection as AnySectionComponent,
    'benefits': BenefitsSection as AnySectionComponent,
    'cta': CtaSection as AnySectionComponent,
    'newsletter': NewsletterSection as AnySectionComponent,
    'promo-grid': PromoGridSection as AnySectionComponent,
    'accreditors': AccreditorsSection as AnySectionComponent,
    'brands': BrandsSection as AnySectionComponent,
    'category-showcase': CategoryShowcaseSection as AnySectionComponent,
    'sale-products': SaleProductsSection as AnySectionComponent,
    'stats': StatsSection as AnySectionComponent,
    'content-split': ContentSplitSection as AnySectionComponent,
}
