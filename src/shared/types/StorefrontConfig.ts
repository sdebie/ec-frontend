export interface NavItem {
  id: string
  label: string
  path: string        // relative path or absolute URL
  external: boolean   // true → opens in new tab
  sortOrder: number
  emphasis?: 'default' | 'cta'
}

export interface AnnouncementConfig {
  enabled: boolean
  text: string
  backgroundColor: string   // CSS colour value, default '#1a1f35'
  textColor: string          // CSS colour value, default '#ffffff'
  /** Show contact slot (phone/WhatsApp) on the left, md+ only. */
  showContact?: boolean
  /** Show social icons on the right, md+ only. */
  showSocial?: boolean
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
   * Band height: 'compact' — a page header rather than a landing banner, for a
   * content page whose hero introduces the page instead of carrying it;
   * 'standard' (default, fixed minimum); 'tall' — viewport-filling with room
   * reserved for the next section's top edge; or 'full', which fills the
   * viewport exactly minus the measured announcement bar + header.
   */
  height?: 'compact' | 'standard' | 'tall' | 'full'
  primaryCta?: StorefrontActionLink
  secondaryCta?: StorefrontActionLink
  backgroundImageUrl?: string
  /**
   * Scrim strength. For `overlayStyle: 'uniform'` (default) this is the flat
   * opacity across the whole photo. For `'gradient-left'` it is the opacity at
   * the LEADING edge, from which the scrim fades to fully transparent — so a
   * gradient hero wants a much higher value than a uniform one.
   */
  overlayOpacity?: number
  /**
   * How the scrim is distributed over the background photo.
   *
   * 'uniform' (default) dims the entire image equally — simple, but it either
   * darkens the whole photograph or leaves the copy short of contrast.
   *
   * 'gradient-left' lays a single left-to-right ramp that is strongest behind
   * the copy and reaches full transparency around the middle/right, so the
   * photo is untouched where nothing sits on it. Pair it with
   * `contentAlignment: 'left'`; a centred hero would run its copy out past the
   * fade. Preferred over a bounded panel, which guarantees contrast but cuts a
   * visible rectangle out of the image.
   */
  overlayStyle?: 'uniform' | 'gradient-left'
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
  /**
   * Whether the copy sits in its own bounded translucent panel rather than
   * directly on the band.
   *
   * Omitted, it derives as before: a panel only when there is no photo to frame
   * the copy. Set `true` over a photo to give the text a constant dark backing,
   * so contrast stops depending on what happens to be in the picture behind any
   * given line — the full-bleed scrim dims the whole image equally and cannot
   * do that. When you set it, drop `overlayOpacity` too: the panel now carries
   * the contrast, so the scrim only needs to calm the photo, and stacking a
   * heavy scrim under the panel makes the image stop reading through it.
   */
  contentPanel?: boolean
  /** Trust/wayfinding line below the CTA pair; segments with `to` render as internal links. */
  footnote?: BenefitsFootnoteSegment[]
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
  /** Reviews across at desktop width. In `carousel` layout this is the per-view count. */
  columns?: 1 | 2 | 3 | 4
  /**
   * Carousel display hint (carousel layout only). Default 'gutter' (preserves
   * current treatment). 'header' passes title into Carousel header prop.
   * Unknown values fall back to 'gutter'.
   */
  carouselControls?: 'header' | 'gutter' | 'overlay'
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
  /** Supporting line under the title; rendered by SectionHeading, so it needs a `title`. */
  subtitle?: string
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
  /**
   * Where the heading block sits: 'above' (default) spans the full width with
   * the cards beneath it; 'side' moves it into a left column at `lg`+ so the
   * cards fill the right and a short heading leaves no dead zone beside it.
   * Below `lg` both stack identically. Applies to the 'cards' layout and the
   * 'strip' layout alike.
   */
  headingPlacement?: 'above' | 'side'
  /**
   * Treatment of the `iconPlacement: 'inline'` icon tile — see
   * `SectionIconBadge`. 'soft' (default) is the faint accent wash; 'solid' is
   * a muted accent tile with the icon in accent-text.
   */
  iconTone?: 'soft' | 'muted' | 'solid'
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
  /** Named icon from the shared section registry, rendered above the tile title. */
  icon?: string
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
  /**
   * How an incomplete final row sits in the 'cards' layout: 'center' (default,
   * preserved behaviour) centres the remainder; 'start' left-aligns it so its
   * tiles line up with the column above. Ignored by 'feature-first', which is a
   * real grid and always column-aligned.
   */
  rowAlign?: 'center' | 'start'
  items: PromoGridItem[]
}

export interface FeaturedProductsSectionProps {
  title: string
  eyebrow?: string
  /** Surface variant — mirrors TestimonialsSectionProps naming. */
  variant?: 'light' | 'dark'
  /** 'row' (default): free-scrolling strip. 'carousel': snap deck with arrows. */
  layout?: 'row' | 'carousel'
  /**
   * Whole cards visible per carousel view at desktop width (carousel layout
   * only; default 3). 5 only reaches five-up at `xl` — below that there is not
   * enough width for five readable product cards, so it steps down to 3.
   */
  columns?: 2 | 3 | 4 | 5
  /** Label rendered as an accent pill on each card (e.g. "Best Seller"). */
  badgeLabel?: string
  category?: string
  limit?: number
  /**
   * Carousel display hint (carousel layout only). Default 'header' (preserves
   * current treatment). 'gutter'/'overlay' pass arrowPlacement to Carousel.
   * Unknown values fall back to 'header'.
   */
  carouselControls?: 'header' | 'gutter' | 'overlay'
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
  /** Surface variant — mirrors BrandsSectionProps naming. */
  variant?: 'light' | 'dark'
  items: AccreditorItem[]
}

// --- Brands section ---

export interface BrandsSectionProps {
  title?: string
  eyebrow?: string
  /** Surface variant — mirrors TestimonialsSectionProps naming. */
  variant?: 'light' | 'dark'
  limit?: number
  /** Minimum brands required to render the section. Default 1 (preserves current behaviour). */
  minItems?: number
}

// --- Category Showcase section ---

export interface CategoryShowcaseSectionProps {
  title: string
  categorySlug: string
  themeColor: string
  /** 'row' (default): free-scrolling strip. 'carousel': snap deck with overlay arrows. */
  layout?: 'row' | 'carousel'
  /** Whole cards visible per carousel view at desktop width (carousel layout only; default 3). */
  columns?: 2 | 3 | 4
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
  /**
   * Carousel display hint (carousel layout only). Default 'overlay' (preserves
   * current treatment). 'header' passes title into Carousel header prop.
   * Unknown values fall back to 'overlay'.
   */
  carouselControls?: 'header' | 'gutter' | 'overlay'
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
  whatsapp?: string
  landline?: string
  physicalAddress?: string
  businessHours?: string
  responseSla?: string
  mapUrl?: string
  mapEmbedUrl?: string
  enquiryEmail?: string
}

export interface QuoteConfig {
  slaText?: string
  validityText?: string
  steps?: string[]
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
  quote?: QuoteConfig
}
