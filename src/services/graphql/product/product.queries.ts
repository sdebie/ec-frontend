import {gql} from "graphql-request";

export const GET_PRODUCTS_LIST = gql`
    query GetProductsList($categoryId: String, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productList(categoryId: $categoryId, pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            name
            description
            retailPrice
            retailSalesPrice
            wholesalePrice
            wholesaleSalesPrice
            productImages {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
            variantIds
            categoryName
        }
    }
`;

export const GET_SALE_PRODUCTS_LIST = gql`
    query GetSaleProductsList($pageRequest: PageRequestInput) {
        saleProductList(pageRequest: $pageRequest) {
            variant {
                id
                sku
                retailPrice
                retailSalesPrice
                wholesalePrice
                wholesaleSalesPrice
                price_start_date
                price_end_date
                stockQuantity
                weightKg
                attributesJson
            }
            product {
                id
                slug
                name
                description
                shortDescription
                productType
                createdAt
                category {
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
            productImages {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
        }
    }
`;

export const VARIANTS_BY_IDS = gql`
    query VariantsByIds($ids: [String!]!) {
        variantsByIds(ids: $ids) {
            id
            sku
            retailPrice
            retailSalesPrice
            wholesalePrice
            wholesaleSalesPrice
            stockQuantity
            weightKg
            attributesJson
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
                category {
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
            productImages {
                id
                imageUrl
                sortOrder
                isFeatured: featured
            }
            variants {
                id
                sku
                stockQuantity
                attributesJson
                weightKg
                retailPrice
                retailSalesPrice
                wholesalePrice
                wholesaleSalesPrice
            }
        }
    }
`;

export const PRODUCT_COUNT = gql`
    query ProductCount($filterRequest: FilterRequestInput) {
        productCount(filterRequest: $filterRequest)
    }
`;
