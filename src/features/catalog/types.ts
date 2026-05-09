import type { Brand } from '@/types/admin/BrandTypes.ts';
import type { Category } from '@/types/admin/CategoryTypes.ts';
import type { ProductShoppingListItem, ProductInformation } from '@/types/admin/ProductTypes.ts';
import type { FilterRequest, PageRequest } from '@/types/graphql/query.types.ts';

export type CatalogProductListItem = ProductShoppingListItem;
export type CatalogProductInformation = ProductInformation;
export type CatalogCategory = Category;
export type CatalogBrand = Brand;

export type CatalogProductsQuery = {
    categoryId?: string | null;
    search?: string;
    sortBy?: 'name' | 'price-asc' | 'price-desc';
    pageIndex?: number;
    pageSize?: number;
};

export type CatalogRequest = {
    pageRequest?: PageRequest | null;
    filterRequest?: FilterRequest | null;
};
