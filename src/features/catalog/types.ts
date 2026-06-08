import type {Brand} from '@/types/shared/BrandTypes.ts';
import type {Category} from '@/types/shared/CategoryTypes.ts';
import type {ProductInformation, ProductShoppingListItem} from '@/types/shared/ProductTypes.ts';
import type {FilterRequest, PageRequest} from '@/types/graphql/query.types.ts';

export type CatalogProductListItem = ProductShoppingListItem;
export type CatalogProductInformation = ProductInformation;
export type CatalogCategory = Category;
export type CatalogBrand = Brand;

export type CatalogProductsQuery = {
    categoryId?: string | null;
    brandId?: string | null;
    search?: string;
    sortBy?: 'name' | 'price-asc' | 'price-desc';
    pageIndex?: number;
    pageSize?: number;
};

export type CatalogRequest = {
    pageRequest?: PageRequest | null;
    filterRequest?: FilterRequest | null;
};
