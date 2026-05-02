import {apiGetAllCategories} from '@/services/graphql/admin/category/CategoryService.graphql.ts'
import {apiGetShoppingProductsList} from '@/services/graphql/product/product.service.ts'
import type {Category} from '@/types/admin/CategoryTypes.ts'
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts'
import type {FilterRequest, PageRequest} from '@/types/graphql/query.types.ts'

export async function fetchStorefrontCatalogueProducts(
    categoryId?: string | null,
    pageRequest?: PageRequest | null,
    filterRequest?: FilterRequest | null,
): Promise<ProductShoppingListItem[]> {
    return apiGetShoppingProductsList(categoryId, pageRequest, filterRequest)
}

export async function fetchStorefrontCatalogueCategories(
    pageRequest: PageRequest,
    filterRequest: FilterRequest,
): Promise<Category[]> {
    return apiGetAllCategories(pageRequest, filterRequest, false)
}
