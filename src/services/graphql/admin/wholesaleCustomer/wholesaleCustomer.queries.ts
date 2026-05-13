import { gql } from 'graphql-request';

const WHOLESALE_CUSTOMER_FIELDS = `
    id
    email
    firstName
    lastName
    phone
    addressLine1
    addressLine2
    city
    province
    postalCode
    status
`;

export const CREATE_WHOLESALE_CUSTOMER = gql`
    mutation CreateWholesaleCustomer($customer: WholesaleCustomerDtoInput!) {
        createWholesaleCustomer(customer: $customer) {
            ${WHOLESALE_CUSTOMER_FIELDS}
        }
    }
`;

export const UPDATE_WHOLESALE_CUSTOMER = gql`
    mutation UpdateWholesaleCustomer($id: String!, $customer: WholesaleCustomerDtoInput!) {
        updateWholesaleCustomer(id: $id, customer: $customer) {
            ${WHOLESALE_CUSTOMER_FIELDS}
        }
    }
`;

