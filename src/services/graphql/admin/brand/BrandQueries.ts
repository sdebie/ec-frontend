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

export const CREATE_BRAND = gql`
    mutation CreateBrand($brandDto: BrandDtoInput!) {
        createBrand(brandDto: $brandDto)
    }
`;

export const UPDATE_BRAND = gql`
    mutation UpdateBrand($id: String!, $brandDto: BrandDtoInput!) {
        updateBrand(id: $id, brandDto: $brandDto)
    }
`;

export const DELETE_BRAND = gql`
    mutation DeleteBrand($id: String!) {
        deleteBrand(id: $id)
    }`;
