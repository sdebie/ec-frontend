export type WholesaleCustomerStatus = 'ACTIVE' | 'DISABLED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
export type WholesaleApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

export type WholesaleCustomer = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    physicalAddressLine1?: string;
    physicalAddressLine2?: string;
    physicalSuburb?: string;
    physicalCity?: string;
    physicalProvince?: string;
    physicalPostalCode?: string;
    postalAddressLine1?: string;
    postalAddressLine2?: string;
    postalSuburb?: string;
    postalCity?: string;
    postalProvince?: string;
    postalPostalCode?: string;
    companyName?: string;
    vatNumber?: string;
    regNumber?: string;
    notes?: string;
    status?: WholesaleCustomerStatus;
};

export type WholesaleCustomerInput = {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    physicalAddressLine1?: string;
    physicalAddressLine2?: string;
    physicalSuburb?: string;
    physicalCity?: string;
    physicalProvince?: string;
    physicalPostalCode?: string;
    postalAddressLine1?: string;
    postalAddressLine2?: string;
    postalSuburb?: string;
    postalCity?: string;
    postalProvince?: string;
    postalPostalCode?: string;
    companyName?: string;
    vatNumber?: string;
    regNumber?: string;
    notes?: string;
    status?: WholesaleCustomerStatus;
};

export type WholesaleApplicationListItem = {
    id: string;
    createdAt?: string;
    status?: WholesaleApplicationStatus;
};

export type WholesaleApplicationDetails = {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    physicalAddressLine1?: string;
    physicalAddressLine2?: string;
    physicalSuburb?: string;
    physicalCity?: string;
    physicalProvince?: string;
    physicalPostalCode?: string;
    postalAddressLine1?: string;
    postalAddressLine2?: string;
    postalSuburb?: string;
    postalCity?: string;
    postalProvince?: string;
    postalPostalCode?: string;
    companyName?: string;
    vatNumber?: string;
    regNumber?: string;
    notes?: string;
    status?: WholesaleApplicationStatus;
    createdAt?: string;
    processedAt?: string;
    customerId?: string;
};

