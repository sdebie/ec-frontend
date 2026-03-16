export const ALL_CATEGORIES_QUERY = /* GraphQL */ `
  query AllCategories {
    allCategories {
      id
      name
      description
    }
  }
`;

export const CATEGORY_BY_ID_QUERY = /* GraphQL */ `
  query CategoryById($id: Int!) {
    category(id: $id) {
      id
      name
      description
      parent {
        id
        name
      }
      children {
        id
        name
      }
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = /* GraphQL */ `
  mutation CreateCategory($category: CategoryEntityInput!) {
    createCategory(category: $category) {
      id
      name
      description
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = /* GraphQL */ `
  mutation UpdateCategory($category: CategoryEntityInput!) {
    updateCategory(category: $category) {
      id
      name
      description
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = /* GraphQL */ `
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id)
  }
`;


