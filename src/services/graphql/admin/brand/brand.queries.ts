import {gql} from "graphql-request";

export const ALL_BRANDS = gql`
    query AllBrands($pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        allBrands(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            name
            description
            slug
            logoUrl
        }
    }
`;

// export const BRAND_COUNT = gql`
//     query BrandCount($filterRequest: FilterRequestInput) {
//         countBrand(filterRequest: $filterRequest)
//     }
// `;