import {gql} from "graphql-request";

export const GET_PRODUCTS_LIST = gql`
    query GetProductsList($pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productList(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            name
            description
            imageName
            variantIds
            categoryNames
            brandName
            status
        }
    }
`;

export const GET_PRODUCTS_LIST_BY_CATEGORY = gql`
    query GetProductsListByCategory($categoryId: String!, $includeSubCategories: Boolean!, $ignoreStatus: Boolean, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productListByCategory(
            categoryId: $categoryId,
            includeSubCategories: $includeSubCategories,
            ignoreStatus: $ignoreStatus,
            pageRequest: $pageRequest,
            filterRequest: $filterRequest
        ) {
            id
            name
            description
            imageName
            variantIds
            categoryNames
            brandName
            status
        }
    }
`;

export const GET_PRODUCTS_LIST_BY_BRAND = gql`
    query GetProductsListByBrand($brandId: String!, $ignoreStatus: Boolean, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productListByBrand(
            brandId: $brandId,
            ignoreStatus: $ignoreStatus,
            pageRequest: $pageRequest,
            filterRequest: $filterRequest
        ) {
            id
            name
            description
            imageName
            variantIds
            categoryNames
            brandName
            status
        }
    }
`;

export const GET_SHOPPING_PRODUCTS_LIST = gql`
    query GetShoppingProductsList($categoryId: String, $ignoreStatus: Boolean, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        shoppingProductList(categoryId: $categoryId, ignoreStatus: $ignoreStatus, pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            name
            shortDescription
            productType
            status
            variantCount
            variantId
            images {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
            retailPrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            wholesalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            retailSalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            wholesaleSalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
        }
    }
`;

export const GET_SALE_PRODUCTS_LIST = gql`
    query GetSaleProductsList($pageRequest: PageRequestInput, $ignoreStatus: Boolean) {
        saleProductList(pageRequest: $pageRequest, ignoreStatus: $ignoreStatus) {
            id
            name
            shortDescription
            productType
            status
            variantCount
            variantId
            images {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
            retailPrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            wholesalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            retailSalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            wholesaleSalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
        }
    }
`;

export const VARIANTS_BY_IDS = gql`
    query VariantsByIds($ids: [String!]!) {
        variantsByIds(ids: $ids) {
            id
            sku
            status
            prices {
                active
                id
                price
                priceEndDate
                priceStartDate
                priceType
                saleDaysRemaining
            }
            stockQuantity
            weightKg
            attributesJson
            images {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
            product { name }
        }
    }
`;

export const GET_PRODUCT_AND_VARIANTS = gql`
    query GetProductInformation($productId: String!) {
        getProductInformation(productId: $productId) {
            product {
                id
                slug
                name
                description
                shortDescription
                productType
                status
                createdAt
                categories {
                    id
                    name
                    slug
                }
                brand {
                    id
                    name
                    slug
                }
            }
            variants {
                id
                sku
                status
                stockQuantity
                attributesJson
                weightKg
                prices {
                    id
                    priceType
                    price
                    priceStartDate
                    priceEndDate
                    isActive: active
                    saleDaysRemaining
                }
                images {
                    id
                    imageUrl
                    sortOrder
                    isFeatured: featured
                }
            }
        }
    }
`;

export const UPDATE_PRODUCT_INFORMATION = gql`
    mutation UpdateProductInformation($productId: String!, $input: ProductInformationDtoInput!) {
        updateProductInformation(productId: $productId, input: $input) {
            product {
                id
                slug
                name
                description
                shortDescription
                productType
                status
                createdAt
                categories {
                    id
                    name
                    slug
                }
                brand {
                    id
                    name
                    slug
                }
            }
            variants {
                id
                sku
                status
                stockQuantity
                attributesJson
                weightKg
                prices {
                    id
                    priceType
                    price
                    priceStartDate
                    priceEndDate
                    isActive: active
                    saleDaysRemaining
                }
                images {
                    id
                    imageUrl
                    sortOrder
                    isFeatured: featured
                }
            }
        }
    }
`;

export const PRODUCT_COUNT = gql`
    query ProductCount($filterRequest: FilterRequestInput, $categoryId: String, $brandId: String, $ignoreStatus: Boolean) {
        productCount(filterRequest: $filterRequest, categoryId: $categoryId, brandId: $brandId, ignoreStatus: $ignoreStatus)
    }
`;

export const GET_TOP_BEST_SELLERS = gql`
    query GetTopBestSellers {
        topBestSellers {
            id
            name
            shortDescription
            productType
            status
            variantCount
            images {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
            retailPrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            wholesalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            retailSalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
            wholesaleSalePrice {
                id
                priceType
                price
                priceStartDate
                priceEndDate
                isActive: active
                saleDaysRemaining
            }
        }
    }
`;
