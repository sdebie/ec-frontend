export type StaffRole = 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'ORDER_MANAGER' | 'VIEWER';

export type Staff = {
    id: string;
    username: string;
    email: string;
    fullName?: string | null;
    role: StaffRole;
    isActive: boolean;
    createdAt?: string | null;
};

