import { gql } from "graphql-request";

const ORDER_FIELDS = `
    id
    sessionId
    status
    createDate
    totalAmount
    items {
        id
        unitPrice
        quantity
        variant {
            id
            stockQuantity
            attributesJson
            weightKg
            product { name }
            images {
                id
                imageUrl
                sortOrder
            }
        }
    }
`;

export const CREATE_ORDER = gql`
    mutation CreateOrder($order: OrderDtoInput!) {
        createOrder(order: $order) {
            ${ORDER_FIELDS}
        }
    }
`;

export const UPDATE_CUSTOMER_INFORMATION = gql`
    mutation UpdateCustomerInformation($sessionId: String!, $customer: CustomerDtoInput!) {
        updateCustomerInformation(sessionId: $sessionId, customer: $customer) {
            email
        }
    }
`;

export const UPDATE_ORDER_STATUS = gql`
    mutation UpdateOrderStatus($sessionId: String!, $status: String!) {
        updateOrderStatus(sessionId: $sessionId, status: $status) {
            id
            status
        }
    }
`;

export const ORDER_BY_ID = gql`
    query OrderById($id: String!) {
        orderById(id: $id) {
            ${ORDER_FIELDS}
        }
    }
`;

export const ORDER_BY_SESSION_ID = gql`
    query OrderBySessionId($sessionId: String!) {
        orderBySessionId(sessionId: $sessionId) {
            ${ORDER_FIELDS}
        }
    }
`;

export const GET_ORDER_DETAIL = gql`
    query GetOrderDetail($orderid: String!) {
        getOrderDetail(orderid: $orderid) {
            id
            sessionId
            totalAmount
            status
            createdAt
            shippingPhone
            shippingAddressLine1
            shippingAddressLine2
            shippingCity
            shippingProvince
            shippingPostalCode
            customerEntity {
                email
            }
            items {
                id
                unitPrice
                quantity
                variant {
                    id
                    stockQuantity
                    attributesJson
                    weightKg
                    product { name }
                    images {
                        id
                        imageUrl
                        sortOrder
                    }
                }
            }
            statusHistory {
                id
                status
                comment
                changedBy
                createdAt
            }
        }
    }
`;

export const ALL_ORDERS = gql`
    query AllOrders($pageRequest: PageRequestInput, $filterRequest: FilterRequestInput) {
        allOrders(pageRequest: $pageRequest, filterRequest: $filterRequest) {
            id
            sessionId
            status
            createDate
            totalAmount
            itemCount
            customer {
                email
            }
        }
    }
`;
