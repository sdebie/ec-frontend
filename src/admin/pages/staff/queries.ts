import {gql} from 'graphql-request'

export const STAFF_LIST = gql`
    query StaffList($pageRequest: PageRequestInput!, $filterRequest: FilterRequestInput) {
        staffList(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            email
            fullName
            role
            active
            resetPassword
            createdAt
        }
    }
`

export const STAFF_COUNT = gql`
    query StaffCount($filterRequest: FilterRequestInput) {
        staffCount(filterRequest: $filterRequest)
    }
`

// addStaffUser/updateStaffUser return Void; a selection set is invalid GraphQL.
// Callers refetch the staff list on success rather than reading the result.
export const ADD_STAFF_USER = gql`
    mutation AddStaffUser($staffDto: StaffDtoInput!) {
        addStaffUser(staffDto: $staffDto)
    }
`

export const UPDATE_STAFF_USER = gql`
    mutation UpdateStaffUser($id: String!, $staffDto: StaffDtoInput!) {
        updateStaffUser(id: $id, staffDto: $staffDto)
    }
`
