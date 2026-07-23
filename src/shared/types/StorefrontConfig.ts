export interface NavItem {
  id: string
  label: string
  path: string        // relative path or absolute URL
  external: boolean   // true → opens in new tab
  sortOrder: number
}

export interface AnnouncementConfig {
  enabled: boolean
  text: string
  backgroundColor: string   // CSS colour value, default '#1a1f35'
  textColor: string          // CSS colour value, default '#ffffff'
}

export interface HeaderConfig {
  announcement?: AnnouncementConfig
}

export interface StorefrontActionLink {
  label: string
  to: string
}

// --- Per-section props types ---

/**
 * Semantic content surface for the hero (and, by convention, any section that
 * needs to render on-brand or on-dark content without a photo behind it).
 * The component only ever picks one of these three buckets and maps each to
 * theme tokens (`--sf-panel`/`--sf-text`, `--sf-accent`/`--sf-accent-text`,
 * `--sf-surface-dark`/`--sf-accent-text`) — no client-specific colour or copy
 * lives in the component itself.
 *
 * - 'default': tokenised light/panel surface. Safe with or without an image.
 * - 'brand':   solid accent-coloured surface (no image needed).
 * - 'dark':    dark surface — the right choice for a photo with a scrim, or
 *              an explicit dark band with no photo.
 */
export type HeroContentSurface = 'default' | 'brand' | 'dark'

export interface HeroSectionProps {
  title: string
  subtitle?: string
  /** Small uppercase label above the title, e.g. "ABOUT UVH HOLDINGS". */
  kicker?: string
  primaryCta?: StorefrontActionLink
  secondaryCta?: StorefrontActionLink
  backgroundImageUrl?: string
  overlayOpacity?: number
  contentAlignment?: 'left' | 'center' | 'right'
  /**
   * @deprecated Use `contentSurface` instead. Only honoured when
   * `backgroundImageUrl` is set — a hero with no image always renders the
   * safe `'default'` surface even if this is `true`, so a stale flag can
   * never wash out the page. Prefer `contentSurface: 'dark'` or `'brand'`
   * to opt into dark/on-brand styling explicitly, with or without a photo.
   */
  darkStyle?: boolean
  /** Explicit semantic surface. Takes precedence over `darkStyle`. */
  contentSurface?: HeroContentSurface
}

export interface CategoryPreviewItem {
  id: string
  label: string
  to: string
  description?: string
  imageSrc?: string
  imageAlt?: string
}

export interface CategoryPreviewSectionProps {
  title: string
  subtitle?: string
  layout?: 'tiles' | 'list'
  columns?: 2 | 3 | 4 | 6
  items: CategoryPreviewItem[]
}

export interface TestimonialsSectionProps {
  heading?: string
  layout?: 'grid' | 'stacked'
  columns?: 1 | 2 | 3
}

export interface BenefitItem {
  title: string
  description: string
}

export interface BenefitsSectionProps {
  title: string
  items: BenefitItem[]
}

export interface CtaSectionProps {
  title: string
  description?: string
  /** Small uppercase label above the title, e.g. "Business & Wholesale". */
  eyebrow?: string
  cta: StorefrontActionLink
  /** Outlined button rendered beside the primary CTA (distinct from secondaryLinks). */
  secondaryCta?: StorefrontActionLink
  secondaryLinks?: StorefrontActionLink[]
  variant?: 'accent' | 'dark'
}

export interface NewsletterSectionProps {
  title: string
  submitLabel: string
  description?: string
  placeholder?: string
  legalText?: string
  secondaryLink?: StorefrontActionLink
  layout?: 'inline' | 'stacked'
}

export interface PromoGridItem {
  id: string
  title: string
  description?: string
  eyebrow?: string
  cta?: StorefrontActionLink
}

export interface PromoGridSectionProps {
  title: string
  subtitle?: string
  layout?: 'cards' | 'feature-first'
  columns?: 2 | 3 | 4
  items: PromoGridItem[]
}

export interface FeaturedProductsSectionProps {
  title: string
  category?: string
  limit?: number
}

// --- Accreditors section ---

export interface AccreditorItem {
  id: string
  name: string
  logoUrl: string
  url?: string
}

export interface AccreditorsSectionProps {
  heading?: string
  items: AccreditorItem[]
}

// --- Brands section ---

export interface BrandsSectionProps {
  heading?: string
  limit?: number
}

// --- Category Showcase section ---

export interface CategoryShowcaseSectionProps {
  title: string
  categorySlug: string
  themeColor: string
  /**
   * Optional full CSS `background` value (typically a `linear-gradient(...)` string)
   * that overrides the themeColor-derived gradient. Lets each row carry its own
   * multi-stop gradient from the DB without hardcoding client-specific colours
   * in the component. When absent, the component falls back to a gradient
   * derived from `themeColor`.
   */
  gradient?: string
  imageUrl?: string
  limit?: number
}

// --- Sale Products section ---

export interface SaleProductsSectionProps {
  title?: string
  limit?: number
  category?: string
}

// --- Stats section ---

export interface StatItem {
  value: string
  label: string
}

export interface StatsSectionProps {
  title?: string
  items: StatItem[]
}

// --- Content Split section ---

export interface ContentSplitSectionProps {
  title: string
  paragraphs: string[]
  imageUrl?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'  // default 'left'
}

// --- Discriminated union members ---

interface SectionBase<T extends string, P> {
  id: string
  type: T
  props: P
}

export type HeroSectionConfig = SectionBase<'hero', HeroSectionProps>
export type FeaturedProductsSectionConfig = SectionBase<'featured-products', FeaturedProductsSectionProps>
export type CategoryPreviewSectionConfig = SectionBase<'category-preview', CategoryPreviewSectionProps>
export type TestimonialsSectionConfig = SectionBase<'testimonials', TestimonialsSectionProps>
export type BenefitsSectionConfig = SectionBase<'benefits', BenefitsSectionProps>
export type CtaSectionConfig = SectionBase<'cta', CtaSectionProps>
export type NewsletterSectionConfig = SectionBase<'newsletter', NewsletterSectionProps>
export type PromoGridSectionConfig = SectionBase<'promo-grid', PromoGridSectionProps>
export type AccreditorsSectionConfig = SectionBase<'accreditors', AccreditorsSectionProps>
export type BrandsSectionConfig = SectionBase<'brands', BrandsSectionProps>
export type CategoryShowcaseSectionConfig = SectionBase<'category-showcase', CategoryShowcaseSectionProps>
export type SaleProductsSectionConfig = SectionBase<'sale-products', SaleProductsSectionProps>
export type StatsSectionConfig = SectionBase<'stats', StatsSectionProps>
export type ContentSplitSectionConfig = SectionBase<'content-split', ContentSplitSectionProps>

export type SectionConfig =
  | HeroSectionConfig
  | FeaturedProductsSectionConfig
  | CategoryPreviewSectionConfig
  | TestimonialsSectionConfig
  | BenefitsSectionConfig
  | CtaSectionConfig
  | NewsletterSectionConfig
  | PromoGridSectionConfig
  | AccreditorsSectionConfig
  | BrandsSectionConfig
  | CategoryShowcaseSectionConfig
  | SaleProductsSectionConfig
  | StatsSectionConfig
  | ContentSplitSectionConfig

export interface StorefrontBrandingLogo {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface StorefrontBranding {
  name: string
  logo?: StorefrontBrandingLogo
}

export interface StorefrontAuthConfig {
  loginStyle?: 'modal' | 'page'
}

export interface FooterCallout {
  heading: string
  body: string
}

export interface FooterColumn {
  heading: string
  links: Array<{ id: string; label: string; to: string; external: boolean }>
}

export interface FooterSocialLink {
  id: string
  label: string
  to: string
  icon: string
}

export interface FooterLegalLink {
  id: string
  label: string
  to: string
  external?: boolean
}

export interface FooterConfig {
  description?: string
  footerCallout?: FooterCallout
  columns?: FooterColumn[]
  socialLinks?: FooterSocialLink[]
  legalLinks?: FooterLegalLink[]
}

export interface ContactConfig {
  emails?: string[]
  phones?: string[]
  landline?: string
  physicalAddress?: string
  businessHours?: string
  responseSla?: string
  mapUrl?: string
  mapEmbedUrl?: string
  enquiryEmail?: string
}

export interface StorefrontConfig {
  clientId: string
  clientName: string
  currency: string
  locale: string
  theme: Record<string, string>
  nav: NavItem[]
  sections: SectionConfig[]
  aboutSections?: SectionConfig[]
  branding: StorefrontBranding
  stickyHeader?: boolean
  header?: HeaderConfig
  auth?: StorefrontAuthConfig
  footer?: FooterConfig
  contact?: ContactConfig
}
