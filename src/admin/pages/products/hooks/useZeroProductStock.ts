import {useMutation, useQueryClient} from '@tanstack/react-query'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {
    GET_PRODUCT_INFORMATION,
    mapToAdminProductDetail,
    type GetProductInformationResponse,
} from './useProductDetail'
import {UPDATE_PRODUCT_INFORMATION} from './useUpdateProduct'
import {toProductInformationInput} from './mappers'
import type {ProductPayload} from '../types'

/**
 * Marks a product out of stock by zeroing every variant's stock through the
 * standard update path: fetch the full aggregate, zero the stocks, save.
 * Reuses the detail READ mapping and the update WRITE mapping, so there is no
 * parallel product serialisation to drift — everything else on the product
 * (prices, images, categories, alt text) round-trips unchanged.
 */
export function useZeroProductStock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (productId: string) => {
            const response = await adminGraphqlClient.request<GetProductInformationResponse>(
                GET_PRODUCT_INFORMATION,
                {productId},
            )
            const data = response.getProductInformation
            if (!data) throw new Error('Product not found')

            const detail = mapToAdminProductDetail(data)
            const payload: ProductPayload = {
                name: detail.name,
                slug: detail.slug,
                shortDescription: detail.shortDescription,
                description: detail.description,
                status: detail.status,
                categoryIds: detail.categories.map((category) => category.id),
                images: detail.images,
                imageIds: detail.imageIds,
                variants: detail.variants.map((variant) => ({...variant, stock: 0})),
            }

            return adminGraphqlClient.request(UPDATE_PRODUCT_INFORMATION, {
                productId,
                input: toProductInformationInput(payload),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin-products-list']})
            queryClient.invalidateQueries({queryKey: ['admin-product-stats']})
        },
    })
}
