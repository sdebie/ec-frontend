export const ALL_BRANDS_QUERY = /* GraphQL */ `
  query AllBrands($searchRequest: SearchRequestInput) {
    allBrands(searchRequest: $searchRequest) {
      id
      name
      description
      slug
      logoUrl
    }
  }
`;

export const BRAND_BY_ID_QUERY = /* GraphQL */ `
  query BrandById($id: UUID!) {
    brand(id: $id) {
      id
      name
      description
      slug
      logoUrl
    }
  }
`;

export const CREATE_BRAND_MUTATION = /* GraphQL */ `
  mutation CreateBrand($brandDto: BrandDtoInput!) {
    createBrand(brandDto: $brandDto)
  }
`;

export const UPDATE_BRAND_MUTATION = /* GraphQL */ `
  mutation UpdateBrand($id: UUID!, $brandDto: BrandDtoInput!) {
    updateBrand(id: $id, brandDto: $brandDto)
  }
`;

export const DELETE_BRAND_MUTATION = /* GraphQL */ `
  mutation DeleteBrand($id: UUID!) {
    deleteBrand(id: $id)
  }
`;


