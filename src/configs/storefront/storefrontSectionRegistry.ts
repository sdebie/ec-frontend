import type {ComponentType} from 'react';
import {PromoGridSection} from '@/components/layout/store/PromoGridSection.tsx';
import {CategoryPreviewSection} from '@/components/layout/store/CategoryPreviewSection.tsx';
import {TestimonialsSection} from '@/components/layout/store/TestimonialsSection.tsx';
import {NewsletterSection} from '@/components/layout/store/NewsletterSection.tsx';
import {HeroSection} from "@/components/layout/store/HeroSection.tsx";
import {StorefrontSectionConfig, StorefrontSectionType} from "@/types/storefront/storefrontTypes.ts";
import {FeaturedProductsSection} from "@/components/layout/store/FeaturedProductsSection.tsx";
import {BenefitsSection} from "@/components/layout/store/BenefitsSection.tsx";
import {CtaSection} from "@/components/layout/store/CtaSection.tsx";

type RegistryComponent = ComponentType<{ props: StorefrontSectionConfig['props'] }>;

export const storefrontSectionRegistry: Record<StorefrontSectionType, RegistryComponent> = {
    hero: HeroSection as RegistryComponent,
    'featured-products': FeaturedProductsSection as RegistryComponent,
    benefits: BenefitsSection as RegistryComponent,
    cta: CtaSection as RegistryComponent,
    'promo-grid': PromoGridSection as RegistryComponent,
    'category-preview': CategoryPreviewSection as RegistryComponent,
    testimonials: TestimonialsSection as RegistryComponent,
    newsletter: NewsletterSection as RegistryComponent,
};
