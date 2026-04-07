import {gql} from "graphql-request";

export const STAFF_LIST = gql`
    query StaffList($pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        staffList(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            username
            email
            fullName
            role
            isActive
            createdAt
        }
    }
`;

export const STAFF_COUNT = gql`
    query StaffCount($filterRequest: FilterRequestInput) {
        staffCount(filterRequest: $filterRequest)
    }
`;

