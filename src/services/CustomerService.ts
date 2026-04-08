import getServiceEndpoint from "../utils/HostnameResolver";
import {CustomerInformation} from "@/pages/shop/default/cart/types";
import {CartStore} from "../store/CartStore.ts";
import {gql} from "graphql-request";
import {GraphQLService} from "./graphql/GraphQLService.ts";

// Allow environment variable override for production deployments
const envGraphQl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? ((import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL)
    : (process?.env?.VITE_API_URL || process?.env?.REACT_APP_API_URL);

const graphQlEndpoint = (envGraphQl && envGraphQl.length > 0)
    ? envGraphQl
    : getServiceEndpoint(8080) + '/api/graphql';

export type CustomerProfile = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  shopperType?: string; // RETURNING | GUEST | undefined
  hasPassword?: boolean;
};

const baseUrl = (() => {
  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? ((import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL)
    : (process?.env?.VITE_API_URL || process?.env?.REACT_APP_API_URL);
  return (env && env.length > 0) ? env.replace(/\/?$/, '') : (getServiceEndpoint(8080) + '');
})();

export async function lookupCustomer(email: string): Promise<CustomerProfile | null> {
  const res = await fetch(`${baseUrl}/api/customers/lookup?email=${encodeURIComponent(email)}`);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function loginCustomer(email: string, password: string): Promise<CustomerProfile> {
  const res = await fetch(`${baseUrl}/api/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export type RegisterOrUpdatePayload = {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

export async function registerOrUpdateCustomer(payload: RegisterOrUpdatePayload): Promise<CustomerProfile> {
  const res = await fetch(`${baseUrl}/api/customers/registerOrUpdate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function apiUpdateCustomerInformation(
    customer: CustomerInformation,
    sessionId?: string
): Promise<CustomerInformation> {
  const sid = sessionId || CartStore.getOrderSessionId();
  if (!sid) {
    throw new Error('Missing sessionId to update customer information');
  }
  if (!customer || !customer.email) {
    throw new Error('Email is required to update customer information');
  }
  console.log("DEBUG:: Updating customer information for sessionId: ", sid, " with email: ", customer.email);
  const mutation = gql`
    mutation UpdateCustomerInformation($sessionId: String!, $customer: CustomerDtoInput!) {
      updateCustomerInformation(sessionId: $sessionId, customer: $customer) {
        email
      }
    }
  `;

  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const result = await client.request<{ updateCustomerInformation: CustomerInformation }>(mutation, {
    sessionId: sid,
    customer: { email: customer.email }
  });

  return result.updateCustomerInformation;
}

// Convenience wrapper returning only CustomerInformation; does not mutate CartStore
export async function updateCustomerInformation(
    customer: CustomerInformation,
    sessionId?: string
): Promise<CustomerInformation> {
  const updated = await apiUpdateCustomerInformation(customer, sessionId);
  return updated;
}