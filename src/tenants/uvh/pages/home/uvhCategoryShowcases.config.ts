export type UvhShowcaseTheme = 'medical-blue' | 'ppe-red' | 'cleaning-green' | 'safety-yellow'

/** Shield artwork in `public/img` — one per themed showcase row. */
export const UVH_SHOWCASE_SHIELD_BY_THEME: Record<UvhShowcaseTheme, { src: string; alt: string }> = {
    'medical-blue': {
        src: '/img/Medical.png',
        alt: 'UVH Medical — supplies and protective equipment',
    },
    'ppe-red': {
        src: '/img/PPE.png',
        alt: 'UVH PPE — personal protective equipment',
    },
    'cleaning-green': {
        src: '/img/Cleaning-Equipment.png',
        alt: 'UVH Cleaning and equipment',
    },
    'safety-yellow': {
        src: '/img/Safety-Wear-Equipment.png',
        alt: 'UVH Safety wear and equipment',
    },
}

export type UvhCategoryShowcaseSpec = {
    id: string
    title: string
    theme: UvhShowcaseTheme
    /** Match against root category names from the API (case-insensitive substring). */
    categoryNameHints: string[]
    viewAllTo: string
    /** Optional artwork under `public/` (e.g. `/img/uvh-medical-shield.png`). */
    decorativeImageSrc?: string
    decorativeImageAlt?: string
}

/**
 * Order matches the four hero category rows on the UVH site.
 * Category resolution is best-effort against live API category names.
 */
export const UVH_CATEGORY_SHOWCASES: UvhCategoryShowcaseSpec[] = [
    {
        id: 'medical',
        title: 'Medical',
        theme: 'medical-blue',
        categoryNameHints: ['medical'],
        viewAllTo: '/products',
    },
    {
        id: 'ppe',
        title: 'PPE',
        theme: 'ppe-red',
        categoryNameHints: ['ppe', 'workwear', 'protective'],
        viewAllTo: '/products',
    },
    {
        id: 'cleaning',
        title: 'Cleaning & Equipment',
        theme: 'cleaning-green',
        categoryNameHints: ['cleaning'],
        viewAllTo: '/products',
    },
    {
        id: 'safety',
        title: 'Safety Wear & Equipment',
        theme: 'safety-yellow',
        categoryNameHints: ['safety'],
        viewAllTo: '/products',
    },
]
