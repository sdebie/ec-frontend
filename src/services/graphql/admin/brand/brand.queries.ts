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

export const BRAND_COUNT = gql`
    query BrandCount($filterRequest: FilterRequestInput) {
        brandCount(filterRequest: $filterRequest)
    }
`;

export const UPDATE_BRAND = gql`
    mutation UpdateBrand($id: String!, $brandDto: BrandDtoInput!) {
        updateBrand(id: $id, brandDto: $brandDto)
    }
`;

