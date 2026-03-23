/**
 * Helper utilities for authorization checks
 */

export interface AuthorizedUser {
    authority: string[];
    [key: string]: any;
}

/**
 * Get the current user's authority from localStorage
 */
export const getUserAuthority = (): string[] => {
    try {
        const adminUser = localStorage.getItem('admin_user');
        if (!adminUser) {
            return [];
        }
        const user = JSON.parse(adminUser) as AuthorizedUser;
        return user.authority || [];
    } catch (error) {
        console.error('Error parsing user authority:', error);
        return [];
    }
};

/**
 * Check if the current user has the required authority for a route
 * @param requiredAuthority - Array of authorities allowed for the route
 * @returns true if user has required authority or route is public (empty array)
 */
export const hasRequiredAuthority = (requiredAuthority: string[]): boolean => {
    // Routes with empty authority array are public
    if (!requiredAuthority || requiredAuthority.length === 0) {
        return true;
    }

    const userAuthority = getUserAuthority();

    // Check if user has at least one of the required authorities
    return requiredAuthority.some(auth => userAuthority.includes(auth));
};

/**
 * Check if a user object has a specific authority
 * @param user - User object with authority array
 * @param requiredAuthority - Array of authorities to check
 */
export const userHasAuthority = (user: AuthorizedUser | null, requiredAuthority: string[]): boolean => {
    if (!user || !requiredAuthority || requiredAuthority.length === 0) {
        return true;
    }

    const userAuthority = user.authority || [];
    return requiredAuthority.some(auth => userAuthority.includes(auth));
};

