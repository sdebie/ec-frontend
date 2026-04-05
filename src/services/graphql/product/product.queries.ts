import {gql} from "graphql-request";

export const GET_PRODUCTS_LIST = gql`
    query GetProductsList($categoryName: String, $pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        productList(categoryName: $categoryName, pageRequest: $pageRequest, filterRequest: $filterRequest) {
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
            }
            variantIds
            categoryName
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

export const GET_PRODUCT_WITH_VARIANTS = gql`
    query GetProductWithVariants($productId: String!) {
        getProductWithVariants(productId: $productId) {
            productId
            productName
            productDescription
            productImages {
                id
                imageUrl
                sortOrder
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
