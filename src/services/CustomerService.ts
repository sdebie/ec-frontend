import getServiceEndpoint from "../utils/HostnameResolver";

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
