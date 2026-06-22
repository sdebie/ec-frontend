import { gql } from 'graphql-request';

const WHOLESALE_CUSTOMER_FIELDS = `
    id
    email
    firstName
    lastName
    phone
    physicalAddressLine1
    physicalAddressLine2
    physicalSuburb
    physicalCity
    physicalProvince
    physicalPostalCode
    postalAddressLine1
    postalAddressLine2
    postalSuburb
    postalCity
    postalProvince
    postalPostalCode
    companyName
    vatNumber
    regNumber
    notes
    status
`;

const WHOLESALE_APPLICATION_LIST_FIELDS = `
    id
    email
    firstName
    lastName
    createdAt
    status
`;

const WHOLESALE_APPLICATION_DETAIL_FIELDS = `
    id
    email
    firstName
    lastName
    phone
    physicalAddressLine1
    physicalAddressLine2
    physicalSuburb
    physicalCity
    physicalProvince
    physicalPostalCode
    postalAddressLine1
    postalAddressLine2
    postalSuburb
    postalCity
    postalProvince
    postalPostalCode
    companyName
    vatNumber
    regNumber
    notes
    status
    createdAt
    processedAt
    customerId
`;

export const CREATE_WHOLESALE_CUSTOMER_FROM_APPLICATION = gql`
    mutation CreateWholesaleCustomer($applicationId: UUID!) {
        createWholesaleCustomer(applicationId: $applicationId) {
            ${WHOLESALE_CUSTOMER_FIELDS}
        }
    }
`;

export const CREATE_WHOLESALE_APPLICATION = gql`
    mutation CreateWholesaleApplication($customer: WholesaleCustomerDtoInput!) {
        createWholesaleApplication(customer: $customer) {
            ${WHOLESALE_CUSTOMER_FIELDS}
        }
    }
`;

export const ALL_WHOLESALE_APPLICATIONS = gql`
    query AllWholesaleApplications($pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        allWholesaleApplications(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            ${WHOLESALE_APPLICATION_LIST_FIELDS}
        }
    }
`;

export const WHOLESALE_APPLICATION_COUNT = gql`
    query WholesaleApplicationCount($filterRequest: FilterRequestInput) {
        wholesaleApplicationCount(filterRequest: $filterRequest)
    }
`;

export const GET_WHOLESALE_APPLICATION = gql`
    query WholesaleApplication($id: String!) {
        wholesaleApplication(id: $id) {
            ${WHOLESALE_APPLICATION_DETAIL_FIELDS}
        }
    }
`;

export const APPROVE_WHOLESALE_APPLICATION = gql`
    mutation ApproveWholesaleApplication($id: String!) {
        approveWholesaleApplication(id: $id) {
            ${WHOLESALE_APPLICATION_DETAIL_FIELDS}
        }
    }
`;

export const REJECT_WHOLESALE_APPLICATION = gql`
    mutation RejectWholesaleApplication($id: String!) {
        rejectWholesaleApplication(id: $id) {
            ${WHOLESALE_APPLICATION_DETAIL_FIELDS}
        }
    }
`;

