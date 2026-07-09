export const StaffRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CATALOG_MANAGER: 'CATALOG_MANAGER',
  ORDER_MANAGER: 'ORDER_MANAGER',
  VIEWER: 'VIEWER',
} as const

export type StaffRoles = (typeof StaffRoles)[keyof typeof StaffRoles]
