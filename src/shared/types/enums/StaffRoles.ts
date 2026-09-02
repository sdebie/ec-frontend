export const StaffRoles = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    CATALOG_MANAGER: 'CATALOG_MANAGER',
    ORDER_MANAGER: 'ORDER_MANAGER',
    VIEWER: 'VIEWER',
} as const

export type StaffRoles = (typeof StaffRoles)[keyof typeof StaffRoles]

/**
 * How a role is written for a human, beside the vocabulary it labels — the same
 * arrangement `OrderStatusOptions` uses for order statuses.
 *
 * Typed `Record<StaffRoles, string>` so adding a role fails to compile until it has
 * a label, rather than rendering the raw `SCREAMING_CASE` value in the UI.
 */
export const StaffRoleLabels: Record<StaffRoles, string> = {
    [StaffRoles.SUPER_ADMIN]: 'Super Admin',
    [StaffRoles.CATALOG_MANAGER]: 'Catalog Manager',
    [StaffRoles.ORDER_MANAGER]: 'Order Manager',
    [StaffRoles.VIEWER]: 'Viewer',
}

/** The same labels as `{value,label}` pairs, for role `<Select>` options. */
export const StaffRoleOptions = (Object.keys(StaffRoleLabels) as StaffRoles[])
    .map((value) => (
        {
            value,
            label: StaffRoleLabels[value],
        }
    ))
