import {OrderStatus} from '@/constants/enums/OrderStatus.ts';
import {GraphQLService} from '@/services/graphql/GraphQLService.ts';
import {FilterRequest, PageRequest} from '@/types/graphql/query.types.ts';
import {OrderData, OrderDetailData, OrderInput} from '@/types/order.types.ts';
import getServiceEndpoint from '@/utils/HostnameResolver.ts';
import {
    ALL_ORDERS,
    CREATE_ORDER,
    GET_ORDER_DETAIL,
    ORDER_BY_ID,
    ORDER_BY_SESSION_ID,
    UPDATE_ORDER_STATUS,
} from './order.queries.ts';

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetAllOrders(pageRequest: PageRequest, filterRequest: FilterRequest): Promise<OrderData[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ allOrders: OrderData[] }>(ALL_ORDERS, {
        pageRequest,
        filterRequest,
    });
    return result.allOrders ?? [];
}

export async function apiCreateOrder(order: OrderInput, sessionId?: string): Promise<OrderData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const payload: OrderInput = {
        ...order,
        sessionId: sessionId ?? order.sessionId,
    };
    const result = await client.request<{ createOrder: OrderData }>(CREATE_ORDER, {order: payload});
    return result.createOrder;
}

export async function apiUpdateOrderStatus(status: OrderStatus, sessionId: string): Promise<{
    id: string;
    status: string
} | null> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ updateOrderStatus: { id: string; status: string } }>(
        UPDATE_ORDER_STATUS,
        {sessionId, status}
    );
    return result.updateOrderStatus ?? null;
}

export async function apiOrderById(id: string): Promise<OrderData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ orderById: OrderData }>(ORDER_BY_ID, {id});
    return result.orderById;
}

export async function apiOrderBySessionId(sessionId: string): Promise<OrderData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ orderBySessionId: OrderData }>(ORDER_BY_SESSION_ID, {sessionId});
    return result.orderBySessionId;
}

export async function apiGetOrderDetail(orderid: string): Promise<OrderDetailData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ getOrderDetail: OrderDetailData }>(GET_ORDER_DETAIL, {orderid});
    return result.getOrderDetail;
}
