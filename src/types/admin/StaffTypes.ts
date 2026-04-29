export type StaffRole = 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'ORDER_MANAGER' | 'VIEWER';

export type Staff = {
    id: string;
    email: string;
    fullName?: string | null;
    role: StaffRole;
    active: boolean;
    resetPassword?: boolean;
    createdAt?: string | null;
};



