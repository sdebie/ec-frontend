import {gql} from "graphql-request";

export const ALL_CATEGORY = gql`
    query AllCategories($pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        allCategories(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            name
            description
            slug
            parent {
                id
                name
            }
            imageUrl
        }
    }
`;

export const CATEGORY_COUNT = gql`
    query CategoryCount($filterRequest: FilterRequestInput) {
        categoryCount(filterRequest: $filterRequest)
    }
`;

export const GET_CATEGORY = gql`
    query CategoryById($id: String!) {
        category(id: $id) {
            id
            name
            slug
            description
            parent {
                id
                name
                slug
                description
            }
            imageUrl
        }
    }
`;

export const CREATE_CATEGORY = gql`
    mutation CreateCategory($categoryDto: CategoryDtoInput!) {
        createCategory(categoryDto: $categoryDto)
    }
`;

export const UPDATE_CATEGORY = gql`
    mutation UpdateCategory($id: String!, $categoryDto: CategoryDtoInput!) {
        updateCategory(id: $id, categoryDto: $categoryDto)
    }
`;

export const DELETE_CATEGORY = gql`
    mutation DeleteCategory($id: String!) {
        deleteCategory(id: $id)
    }`;