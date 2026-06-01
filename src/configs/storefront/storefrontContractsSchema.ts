import {z} from 'zod'

import type {StorefrontCmsPageDefinition, StorefrontSlotContribution} from '@/types/storefront/storefrontTypes'

const slotIdSchema = z.string().min(1)

const slotContributionSchema = z
    .object({
        id: z.string().min(1),
        slot: slotIdSchema,
        order: z.number().finite().optional(),
        content: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
            })
            .strict(),
    })
    .strict()

const cmsHeroBlockSchema = z
    .object({
        id: z.string().min(1),
        type: z.literal('hero'),
        content: z
            .object({
                title: z.string().optional(),
                subtitle: z.string().optional(),
            })
            .strict(),
    })
    .strict()

const cmsRichTextBlockSchema = z
    .object({
        id: z.string().min(1),
        type: z.literal('rich-text'),
        content: z
            .object({
                body: z.string().optional(),
            })
            .strict(),
    })
    .strict()

const cmsCtaBlockSchema = z
    .object({
        id: z.string().min(1),
        type: z.literal('cta'),
        content: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
            })
            .strict(),
    })
    .strict()

const cmsBlockSchema = z.discriminatedUnion('type', [
    cmsHeroBlockSchema,
    cmsRichTextBlockSchema,
    cmsCtaBlockSchema,
])

const cmsPageSchema = z
    .object({
        path: z.string().startsWith('/'),
        title: z.string().min(1),
        blocks: z.array(cmsBlockSchema),
    })
    .strict()

export function parseSlotContribution(
    value: unknown,
): StorefrontSlotContribution | null {
    const result = slotContributionSchema.safeParse(value)
    return result.success ? (result.data as StorefrontSlotContribution) : null
}

export function parseCmsPageDefinition(
    value: unknown,
): StorefrontCmsPageDefinition | null {
    const result = cmsPageSchema.safeParse(value)
    return result.success ? (result.data as StorefrontCmsPageDefinition) : null
}
