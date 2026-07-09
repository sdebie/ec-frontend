export interface StaffMember {
  id: string
  email: string
  fullName: string | null
  role: 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'ORDER_MANAGER' | 'VIEWER'
  active: boolean
  resetPassword: boolean
  createdAt: string | null
}

export interface StaffFormValues {
  email: string
  fullName: string
  role: StaffMember['role']
  isActive: boolean
  temporaryPassword?: string // create only
}
