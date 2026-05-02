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

export const uvhHomeContent = {
    hero: {
        overline: 'WHOLESALE & RETAIL SUPPLIER',
        title: 'UVH Holdings',
        heroImage: '/img/uvh-holding-hero.jpg',
        heroImageAlt:
            'Industrial safety boots on a concrete floor with hazard markings, representing workplace PPE supply.',
        subtitle:
            'Medical, PPE, Cleaning & Equipment, Safety Wear & Equipment, Hospitality, Household, Bulk Paper Products and Automotives — all in one place.',
        notice:
            'We will beat any price and quote. We will also assist you in all your tender needs! Please note that prices may not be accurate and are subject to change after order completion due to supply chain disruptions in the Middle East driving up supplier prices.',
        primaryCta: {label: 'Get a Quote', to: '/contact-us'},
        secondaryCta: {label: 'Browse Products', to: '/products'},
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
    testimonials: [
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
                'UVH is always willing to assist with the best prices as well as fast and efficient service.',
            author: 'Bianca Olivier',
        },
        {
            id: 'reflect',
            quote: 'Best service and unbeatable prices.',
            author: 'Reflect FC',
        },
    ] as UvhTestimonial[],
} as const;

export const uvhAboutContent = {
    intro:
        'UVH Holdings supplies PPE, medical, cleaning and workplace essentials to business, wholesale and institutional buyers across South Africa.',
    mission:
        'Deliver dependable supply, competitive pricing and responsive service that helps procurement teams keep operations running.',
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
