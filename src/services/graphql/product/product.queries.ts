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
        }
    }
`;

export const GET_PRODUCTS_LIST_BY_CATEGORY = gql`
    query GetProductsListByCategory($categoryId: String!, $includeSubCategories: Boolean!, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productListByCategory(
            categoryId: $categoryId,
            includeSubCategories: $includeSubCategories,
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
        }
    }
`;

export const GET_PRODUCTS_LIST_BY_BRAND = gql`
    query GetProductsListByBrand($brandId: String!, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productListByBrand(
            brandId: $brandId,
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
        }
    }
`;

export const GET_SHOPPING_PRODUCTS_LIST = gql`
    query GetShoppingProductsList($categoryId: String, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        shoppingProductList(categoryId: $categoryId, pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            name
            shortDescription
            productType
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
    query GetSaleProductsList($pageRequest: PageRequestInput) {
        saleProductList(pageRequest: $pageRequest) {
            id
            name
            shortDescription
            productType
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
    query ProductCount($filterRequest: FilterRequestInput) {
        productCount(filterRequest: $filterRequest)
    }
`;

export const GET_TOP_BEST_SELLERS = gql`
    query GetTopBestSellers {
        topBestSellers {
            id
            name
            shortDescription
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
