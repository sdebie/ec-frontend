export type WholesaleCustomerStatus = 'ACTIVE' | 'DISABLED' | 'REGISTERING';

export type WholesaleCustomer = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    status?: WholesaleCustomerStatus;
};

export type WholesaleCustomerInput = {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    status?: WholesaleCustomerStatus;
};

