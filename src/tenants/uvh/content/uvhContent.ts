export type UvhCategoryHighlight = {
    id: string;
    label: string;
    description: string;
    to: string;
};

export type UvhTestimonial = {
    id: string;
    quote: string;
    author: string;
};

export type UvhTrustPoint = {
    id: string;
    title: string;
    description: string;
};

export type UvhBrandTile = {
    id: string;
    label: string;
    imageSrc?: string;
    imageAlt?: string;
    /** Tailwind classes for text tiles (ignored when imageSrc is set). */
    labelClassName?: string;
};

export type UvhHeroLogo = {
    src: string;
    alt: string;
};

export type UvhHeroDescriptionSegment = {
    text: string;
    bold?: boolean;
};

export type UvhHeroServiceTile = {
    id: string;
    imageSrc: string;
    imageAlt: string;
    label: string;
};

export type UvhHeroSloganPart = {
    text: string;
    accent?: boolean;
};

export type UvhHeroShield = {
    id: string;
    imageSrc: string;
    imageAlt: string;
};

export type UvhHeroStatIcon = 'package' | 'truck' | 'mapPin' | 'shieldCheck';

export type UvhHeroStat = {
    id: string;
    icon?: UvhHeroStatIcon;
    value?: string;
    label: string;
};

const uvhHomeTestimonials = [
    {
        id: 'juan',
        quote: 'Very well priced on all safety work wear. Amazing service.',
        author: 'Juan Pierre Prinsloo',
    },
    {
        id: 'maggi',
        quote: 'Super friendly staff and quick turnaround time.',
        author: 'Maggi Sigg',
    },
    {
        id: 'bianca',
        quote:
            'Uvh is always willing to assist with the best prices as well as the friendliest, fast and efficient service. Well done team. Looking forward towards 2025!',
        author: 'Bianca Olivier',
    },
    {
        id: 'reflect',
        quote: 'Best service and unbeatable prices.',
        author: 'Reflect FC',
    },
    {
        id: 'l3-supplies',
        quote: 'Very efficient service and an excellent product. Steve is a pleasure to work with.',
        author: 'L3 Supplies',
    },
    {
        id: 'renee-moll',
        quote: 'Best service quality and price - well done Keith and Thank you',
        author: 'Renee Moll',
    },
] as const satisfies readonly UvhTestimonial[];

export const uvhHomeContent = {
    hero: {
        logo: {
            src: '/img/uvh-logo.png',
            alt: 'UVH Holdings',
        } as UvhHeroLogo,
        titleLine1: 'We will beat',
        titleLine2: 'Any written quote',
        description: [
            {text: 'Medical, PPE, Cleaning & Equipment, Safety Wear & Equipment, Hospitality, Household, Bulk Paper Products and Automotives — all in one place. '},
        ] as readonly UvhHeroDescriptionSegment[],
        heroImage: '/img/uvh-hero-new.png',
        heroImageAlt:
            'UVH Holdings truck reversing into a warehouse loading bay with a stylised red brand chevron overlay.',
        notice:
            'We will beat any price and quote. We will also assist you in all your tender needs! Please note that prices may not be accurate and are subject to change after order completion due to supply chain disruptions in the Middle East driving up supplier prices.',
        primaryCta: {label: 'Get a Quote', to: '/contact-us'},
        secondaryCta: {label: 'Browse Products', to: '/products'},
        services: [
            {
                id: 'medical',
                imageSrc: '/img/uvh/shields/medical.png',
                imageAlt: 'UVH Medical sub-brand shield',
                label: 'Medical',
            },
            {
                id: 'safety',
                imageSrc: '/img/uvh/shields/safety-wear-equipment.png',
                imageAlt: 'UVH Safety Wear & Equipment sub-brand shield',
                label: 'Safety Wear & Equipment',
            },
            {
                id: 'cleaning',
                imageSrc: '/img/uvh/shields/cleaning-equipment.png',
                imageAlt: 'UVH Cleaning & Equipment sub-brand shield',
                label: 'Cleaning & Equipment',
            },
            {
                id: 'ppe',
                imageSrc: '/img/uvh/shields/ppe.png',
                imageAlt: 'UVH PPE sub-brand shield',
                label: 'PPE',
            },
        ] as readonly UvhHeroServiceTile[],
        slogan: [
            {text: 'Building.'},
            {text: 'Empowering.'},
            {text: 'Growing'},
            {text: 'Together.', accent: true},
        ] as readonly UvhHeroSloganPart[],
        shields: [
            {
                id: 'cleaning',
                imageSrc: '/img/uvh/shields/cleaning-equipment.png',
                imageAlt: 'UVH Cleaning & Equipment sub-brand shield'
            },
            {id: 'medical', imageSrc: '/img/uvh/shields/medical.png', imageAlt: 'UVH Medical sub-brand shield'},
            {id: 'ppe', imageSrc: '/img/uvh/shields/ppe.png', imageAlt: 'UVH PPE sub-brand shield'},
            {
                id: 'safety',
                imageSrc: '/img/uvh/shields/safety-wear-equipment.png',
                imageAlt: 'UVH Safety Wear & Equipment sub-brand shield'
            },
        ] as readonly UvhHeroShield[],
        stats: [
            {
                id: 'delivery',
                icon: 'truck',
                value: '48H',
                label: 'Target fulfilment window (where practical)',
            },
            {
                id: 'reach',
                icon: 'mapPin',
                value: 'SA & Africa',
                label: 'Nationwide delivery and export support',
            },
            {
                id: 'supplier',
                icon: 'package',
                value: 'One supplier',
                label: 'PPE, cleaning, hygiene, medical consumables',
            },
            {
                id: 'trust',
                icon: 'shieldCheck',
                value: 'Trusted by',
                label: 'Businesses across South Africa',
            },
        ] as readonly UvhHeroStat[],
    },
    highlights: [
        {
            id: 'pricing',
            title: 'Competitive pricing',
            description: 'We will beat any price and quote where possible, with transparent communication.',
        },
        {
            id: 'wholesale',
            title: 'Wholesale support',
            description: 'Bulk ordering support for business, schools, hospitality and procurement teams.',
        },
        {
            id: 'tenders',
            title: 'Tender assistance',
            description: 'Practical support for tender-related sourcing and recurring supply requests.',
        },
    ] as const,
    categories: [
        {
            id: 'workwear-ppe',
            label: 'Workwear & PPE',
            description: 'Safety gear, protective wear, boots, gloves and masks.',
            to: '/products',
        },
        {
            id: 'medical',
            label: 'Medical',
            description: 'First aid, gowns, lab coats, gloves and waste containers.',
            to: '/products',
        },
        {
            id: 'hospitality',
            label: 'Hospitality',
            description: 'Catering, cleaning equipment, safety gear and consumables.',
            to: '/products',
        },
        {
            id: 'safety',
            label: 'Safety Wear & Equipment',
            description: 'Head, eye, ear and fall-protection products for industrial environments.',
            to: '/products',
        },
        {
            id: 'cleaning',
            label: 'Cleaning & Equipment',
            description: 'Chemicals, cloths, wipes, tools and industrial supplies.',
            to: '/products',
        },
    ] as UvhCategoryHighlight[],
    trustPoints: [
        {
            id: 'delivery',
            title: 'Delivery',
            description: 'Delivery areas and lead times vary by product and location.',
        },
        {
            id: 'returns',
            title: 'Returns',
            description: 'We help you handle returns quickly and fairly.',
        },
        {
            id: 'payments',
            title: 'Secure payments',
            description: 'Secure checkout and trusted payment methods.',
        },
        {
            id: 'support',
            title: 'Support',
            description: 'Need help choosing products or ordering in bulk? We can assist.',
        },
    ] as UvhTrustPoint[],
    getQuoteCta: {
        overline: 'GET A QUOTE',
        title: 'Get a Quote',
        description:
            "Send us your list and we'll come back with a fast, competitive quote — we can beat any quote.",
        cta: {label: 'Get a Quote', to: '/contact-us'},
    },
    wholesaleCta: {
        overline: 'BUSINESS & WHOLESALE',
        title: 'Buying in Bulk?',
        description:
            'Open a wholesale account for business pricing, bulk ordering, and faster quoting.',
        cta: {label: 'Apply for a Wholesale Account', to: '/wholesale-application'},
    },
    accreditorsSection: {
        heading: 'Accreditors',
        items: [
            {
                id: 'sabs',
                imageSrc: '/img/sabs-logo.png',
                imageAlt: 'SABS — South African Bureau of Standards',
            },
            {
                id: 'sahpra',
                imageSrc: '/img/SAHPRA-logo.png',
                imageAlt: 'SAHPRA — South African Health Products Regulatory Authority',
            },
            {
                id: 'safripol',
                imageSrc: '/img/Safripol-Logo.png',
                imageAlt: 'Safripol',
            },
        ],
    },
    testimonials: uvhHomeTestimonials,
    customerReviewsSection: {
        overline: 'CUSTOMER REVIEWS',
        title: 'What Our Customers Say',
        items: uvhHomeTestimonials,
    },
} as const;

export const uvhAboutContent = {
    intro:
        'PPE, hygiene, and medical disposable supply—built on quality, affordability, and fast, reliable fulfilment.',
    mission:
        'Deliver dependable supply, competitive pricing and responsive service that helps procurement teams keep operations running.',
    highlights: [
        {
            title: '48h',
            subtitle: 'Target fulfilment window (where practical)',
            description:
                'We aim to get your orders processed and dispatched within 48 hours.',
        },
        {
            title: 'SA + Africa',
            subtitle: 'Nationwide delivery and export support',
            description:
                'Reliable delivery across South Africa and to key African markets.',
        },
        {
            title: 'One supplier',
            subtitle: 'PPE, cleaning, hygiene, medical consumables',
            description:
                'A complete range of essential products from one trusted partner.',
        },
    ] as const,
    companyOverview: {
        eyebrow: 'Company Overview',
        title: 'Company Overview',
        mission: {
            label: 'M',
            heading: 'Mission',
            body: 'To supply what customers need—when they need it—at the best possible price. Where demand is strong, we manufacture and source at scale to keep stock consistent. Our goal is to fulfil and deliver within 48 hours where practical (subject to stock availability and delivery destination).',
        },
        vision: {
            label: 'V',
            heading: 'Vision',
            body: 'To become the most trusted supplier and manufacturer of PPE, medical disposables, and hygiene products in South Africa—and a preferred partner to wholesalers across Africa.',
        },
        closing:
            'UVH Holdings offers a comprehensive range of PPE, hygiene, and medical disposable products. We work with trusted suppliers, premium materials, and reliable manufacturing processes to deliver products that meet relevant quality and regulatory expectations.',
    },
    productsAndServices: {
        eyebrow: 'Products and Services',
        title: 'Products and Services',
        items: [
            {
                id: 'ppe',
                label: '1',
                heading: 'Personal Protective Equipment (PPE)',
                body: 'From masks and gloves to gowns and face shields, our PPE range supports a wide variety of industries and applications—helping teams stay protected and compliant.',
            },
            {
                id: 'hygiene-cleaning',
                label: '2',
                heading: 'Hygiene and Cleaning Chemicals',
                body: 'We supply effective cleaning chemicals and hygiene products suitable for commercial and industrial environments—designed to help maintain clean, safe, and professional facilities.',
            },
            {
                id: 'medical-disposables',
                label: '3',
                heading: 'Medical Disposable Products',
                body: 'We stock medical-grade disposable essentials such as gauze, syringes, gloves, and more—supporting clinics, practices, and healthcare operations.',
            },
            {
                id: 'sanitizer-wipes',
                label: '4',
                heading: 'Sanitizer Wipes Manufacturing',
                body: 'UVH Holdings manufactures high-quality sanitizer wipes for convenient on-the-go sanitisation—efficient, practical, and suitable for everyday use.',
            },
        ] as const,
    },
    valuePropositions: {
        competitiveAdvantage: {
            title: 'Competitive Advantage',
            items: [
                {
                    id: 'quality-assurance',
                    title: 'Quality assurance',
                    body: 'Products go through checks aligned to supplier and industry expectations.',
                },
                {
                    id: 'affordability',
                    title: 'Affordability',
                    body: 'Efficient procurement and streamlined operations help keep pricing competitive.',
                },
                {
                    id: 'one-stop-range',
                    title: 'One-stop range',
                    body: 'PPE, hygiene, and medical disposables in one place—simplifying buying and reordering.',
                },
                {
                    id: 'ecommerce',
                    title: 'E-commerce platform',
                    body: 'Browse, order, and track efficiently with a user-friendly online store.',
                },
                {
                    id: 'delivery-export',
                    title: 'Nationwide delivery + export',
                    body: 'We deliver across South Africa and support export to selected African countries.',
                },
            ] as const,
            footerBeforeLink:
                'If you want to understand delivery timelines and return handling, view our ',
            footerLinkLabel: 'Delivery and Returns Policy',
            footerLinkTo: '/delivery-and-returns-policy',
            footerAfterLink: '.',
        },
        whatMakesUsDifferent: {
            title: 'What Makes Us Different',
            items: [
                {
                    id: 'sourcing',
                    title: 'Sourcing excellence',
                    body: 'Strong supplier relationships help maintain consistent quality and availability.',
                },
                {
                    id: 'manufacturing',
                    title: 'Manufacturing innovation',
                    body: 'Ongoing investment in processes and capability to meet demand.',
                },
                {
                    id: 'wholesale-service',
                    title: 'Wholesale-first service',
                    body: 'Built to support repeat buyers and wholesalers with dependable fulfilment.',
                },
                {
                    id: 'customer-satisfaction',
                    title: 'Customer satisfaction',
                    body: 'Responsive support, practical guidance, and reliable delivery.',
                },
            ] as const,
            footerBeforeWholesale: 'For wholesale buying and account enquiries, visit our ',
            footerWholesaleLabel: 'Wholesale page',
            footerWholesaleTo: '/wholesale-application',
            footerMid: ' or ',
            footerContactLabel: 'contact us',
            footerContactTo: '/contact-us',
            footerAfter: '.',
        },
        leadershipTeam: {
            title: 'Leadership Team',
            body: "We're a hands-on team focused on quality supply, fast fulfilment, and a smooth buying experience.",
        },
    },
    coreCategories: {
        eyebrow: 'Core categories',
        title: 'Everything your business needs, in one place.',
        items: [
            {
                id: 'medical',
                title: 'Medical',
                description:
                    'Medical disposables and clinic essentials for practices, facilities, and healthcare operations.',
                imageSrc: '/img/uvh/shields/medical.png',
                imageAlt: 'Medical and clinical supplies',
            },
            {
                id: 'ppe',
                title: 'PPE',
                description:
                    'Protection you can rely on—from gloves and masks to workplace PPE for multiple industries.',
                imageSrc: '/img/uvh/shields/ppe.png',
                imageAlt: 'Personal protective equipment',
            },
            {
                id: 'cleaning-equipment',
                title: 'Cleaning & Equipment',
                description:
                    'Cleaning chemicals, hygiene supplies, and equipment to keep facilities safe and compliant.',
                imageSrc: '/img/uvh/shields/cleaning-equipment.png',
                imageAlt: 'Cleaning and hygiene products',
            },
            {
                id: 'safety-wear',
                title: 'Safety Wear & Equipment',
                description:
                    'Workwear and safety equipment designed for tough environments and daily use.',
                imageSrc: '/img/uvh/shields/safety-wear-equipment.png',
                imageAlt: 'Safety wear and workplace equipment',
            },
        ] as const,
    },
    differentiators: [
        'Broad category coverage across medical, PPE, cleaning, hospitality and household.',
        'Fast quote turnaround with procurement-oriented support.',
        'Wholesale-focused supply support for repeat and bulk orders.',
        'Practical assistance for tender and business purchasing requirements.',
    ] as const,
    accreditors: ['SABS', 'SAHPRA', 'Safripol'] as const,
} as const;

export const uvhContactContent = {
    address: '207 Edison Crescent, Centurion, Gauteng, 0157, South Africa',
    phones: ['+27 76 819 5245', '+27 71 461 4419'] as const,
    landline: '+27 12 994 9184',
    emails: [
        'info@uvhholdings.co.za',
        'sales@uvhholdings.co.za',
        'accounts@uvhholdings.co.za',
    ] as const,
    responseSla: 'Typical response time: within one business day.',
} as const;
