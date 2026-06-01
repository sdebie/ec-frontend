
import {BenefitsSection} from "@/components/storefront/sections/BenefitsSection.tsx";
import {CategoryPreviewSection} from '@/components/storefront/sections/CategoryPreviewSection.tsx';
import {CtaSection} from "@/components/storefront/sections/CtaSection.tsx";
import {FeaturedProductsSection} from "@/components/storefront/sections/FeaturedProductsSection.tsx";
import {HeroSection} from "@/components/storefront/sections/HeroSection.tsx";
import {NewsletterSection} from '@/components/storefront/sections/NewsletterSection.tsx';
import {PromoGridSection} from '@/components/storefront/sections/PromoGridSection.tsx';
import {TestimonialsSection} from '@/components/storefront/sections/TestimonialsSection.tsx';
import {StorefrontSectionConfig, StorefrontSectionType} from "@/types/storefront/storefrontTypes.ts";

import type {ComponentType} from 'react';

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
