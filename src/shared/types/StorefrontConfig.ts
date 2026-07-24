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
  /**
   * Band height: 'standard' (default, fixed minimum) or 'tall' — viewport-filling,
   * for landing heroes whose background image composition needs the vertical room.
   */
  height?: 'standard' | 'tall'
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
  eyebrow?: string
  /** Surface variant — mirrors TestimonialsSectionProps naming. */
  variant?: 'light' | 'dark'
  layout?: 'tiles' | 'list'
  /** Tile-card media placement: image above the text (default) or beside it on the left. */
  imagePosition?: 'top' | 'left'
  columns?: 2 | 3 | 4 | 6
  items: CategoryPreviewItem[]
}

export interface TestimonialsSectionProps {
  title?: string
  eyebrow?: string
  variant?: 'light' | 'dark'
  layout?: 'grid' | 'stacked' | 'carousel'
  columns?: 1 | 2 | 3
}

export interface BenefitItem {
  title: string
  description: string
  icon?: string
}

/** Inline sentence segment below the grid; segments with `to` render as links. */
export interface BenefitsFootnoteSegment {
  text: string
  to?: string
}

export interface BenefitsSectionProps {
  /** Optional so a heading-less 'strip' can render as a pure band (the stats-band effect). */
  title?: string
  eyebrow?: string
  /** Surface variant — mirrors TestimonialsSectionProps naming. */
  variant?: 'light' | 'dark'
  /**
   * 'cards' (default): bordered panel cards. 'strip': collapses items into a
   * compact divided band (the StatsSection treatment) — icon + title + description
   * centered per block; pairs well with `variant: "dark"` directly under a hero.
   */
  layout?: 'cards' | 'strip'
  /** Where item icons sit relative to the title: above it (default) or on the same line. */
  iconPlacement?: 'top' | 'inline'
  /** Explicit desktop column count; absent → derived from the item count (no-orphan rule). */
  columns?: 2 | 3 | 4
  items: BenefitItem[]
  footnote?: BenefitsFootnoteSegment[]
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
  eyebrow?: string
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
  imageUrl?: string
  cta?: StorefrontActionLink
}

export interface PromoGridSectionProps {
  title: string
  subtitle?: string
  eyebrow?: string
  /** Named icon from the shared section registry, rendered beside the heading title. */
  icon?: string
  layout?: 'cards' | 'feature-first'
  /** Tighter band rhythm (py-8) and heading margin for a slimmer section. */
  compact?: boolean
  columns?: 2 | 3 | 4 | 5
  items: PromoGridItem[]
}

export interface FeaturedProductsSectionProps {
  title: string
  eyebrow?: string
  /** Surface variant — mirrors TestimonialsSectionProps naming. */
  variant?: 'light' | 'dark'
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
  title?: string
  eyebrow?: string
  items: AccreditorItem[]
}

// --- Brands section ---

export interface BrandsSectionProps {
  title?: string
  eyebrow?: string
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
  eyebrow?: string
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
  /** Small uppercase label above the title — rendered only when title is present. */
  eyebrow?: string
  /** Surface variant — mirrors TestimonialsSectionProps naming. */
  variant?: 'light' | 'dark'
  items: StatItem[]
}

// --- Content Split section ---

/** Titled card rendered below the paragraphs (e.g. Mission / Vision), with an optional letter badge. */
export interface ContentSplitCard {
  /** Short badge text rendered in an accent square beside the title — typically one letter. */
  badge?: string
  title: string
  paragraphs: string[]
}

export interface ContentSplitSectionProps {
  eyebrow?: string
  title: string
  paragraphs: string[]
  cards?: ContentSplitCard[]
  /** Closing note under the cards — same segment shape as BenefitsSectionProps.footnote. */
  footnote?: BenefitsFootnoteSegment[]
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
