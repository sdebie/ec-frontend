import {StaffRoles} from '@/shared/types/enums/StaffRoles'
import {useAdminAuthStore} from './adminAuthStore'

const {SUPER_ADMIN, CATALOG_MANAGER, ORDER_MANAGER} = StaffRoles

/**
 * UI mirror of the backend's `@RolesAllowed` sets, one capability per operation
 * family. The backend is the enforcement boundary — it re-checks every request —
 * so an entry here only decides which affordances the admin UI shows; widening a
 * set cannot grant access the backend denies. Each entry must match the
 * annotations on the named backend resource: when a `@RolesAllowed` changes,
 * change the matching entry here.
 */
export const ADMIN_CAPABILITIES = {
    /** ProductResource addProductInformation / updateProductInformation. */
    'product:write': [SUPER_ADMIN, CATALOG_MANAGER],
    /** ProductResource updateProductStatus / deleteProduct. */
    'product:lifecycle': [SUPER_ADMIN],
    /** ProductResource setProductFeatured (featuredProductList reads add VIEWER). */
    'featured:write': [SUPER_ADMIN],
    /** BrandResource createBrand / updateBrand / deleteBrand. */
    'brand:write': [SUPER_ADMIN, CATALOG_MANAGER],
    /** CategoryResource createCategory / updateCategory / deleteCategory. */
    'category:write': [SUPER_ADMIN, CATALOG_MANAGER],
    /** ProductUploadResource + ProductUploadGraphQLResource — batch reads included. */
    'import:manage': [SUPER_ADMIN, CATALOG_MANAGER],
    /** ImageResource — uploads, cleanup, and the directory/image-list reads. */
    'image:write': [SUPER_ADMIN, CATALOG_MANAGER],
    /** OrderResource updateOrderStatus. */
    'order:write': [SUPER_ADMIN, ORDER_MANAGER],
    /** QuoteRequestAdminResource updateQuoteRequestStatus. */
    'quote:write': [SUPER_ADMIN, ORDER_MANAGER],
    /** WholesaleCustomerResource approve/rejectWholesaleApplication. */
    'wholesale-application:decide': [SUPER_ADMIN, ORDER_MANAGER],
    /** WholesaleCustomerResource updateWholesaleCustomer. */
    'wholesale-customer:write': [SUPER_ADMIN],
    /** CustomerAdminResource updateCustomerStatus. */
    'customer:write': [SUPER_ADMIN],
    /** SettingsResource updateSetting / saveStoreSettings / saveShippingMethod (the list reads are unannotated). */
    'settings:write': [SUPER_ADMIN],
    /** StaffResource (GraphQL) — reads and writes are both SUPER_ADMIN-only. */
    'staff:manage': [SUPER_ADMIN],
    /** AdminTestimonialResource POST / PUT / DELETE. */
    'testimonial:write': [SUPER_ADMIN],
    /** AdminPageContentResource PUT / publish. */
    'legal:write': [SUPER_ADMIN],
} as const satisfies Record<string, readonly StaffRoles[]>

export type AdminCapability = keyof typeof ADMIN_CAPABILITIES

/**
 * Pure capability check. `role` is the raw store value (untyped wire string) so
 * an unknown or absent role safely resolves to false.
 */
export function roleCan(role: string | null, capability: AdminCapability): boolean {
    return role != null && (ADMIN_CAPABILITIES[capability] as readonly string[]).includes(role)
}

/** Reactive capability check — re-renders the caller when the session role changes. */
export function useCan(capability: AdminCapability): boolean {
    const role = useAdminAuthStore((s) => s.role)
    return roleCan(role, capability)
}

/**
 * Route-config adapter: the roles admitted to a capability, as the mutable
 * array the `authority` route field expects.
 */
export function rolesFor(capability: AdminCapability): string[] {
    return [...ADMIN_CAPABILITIES[capability]]
}
