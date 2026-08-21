import {beforeEach, describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {AuthorityCheck} from '../AuthorityCheck'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

describe('AuthorityCheck', () => {
    beforeEach(() => {
        useAdminAuthStore.setState({role: null})
    })

    it('renders children when the user has the required capability', () => {
        useAdminAuthStore.setState({role: 'SUPER_ADMIN'})

        render(
            <AuthorityCheck capability="brand:write">
                <span>Protected content</span>
            </AuthorityCheck>
        )

        expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    it('renders nothing when the user lacks the required capability', () => {
        useAdminAuthStore.setState({role: 'VIEWER'})

        const {container} = render(
            <AuthorityCheck capability="brand:write">
                <span>Protected content</span>
            </AuthorityCheck>
        )

        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
        expect(container.innerHTML).toBe('')
    })

    it('renders nothing when role is null (no session)', () => {
        const {container} = render(
            <AuthorityCheck capability="order:write">
                <span>Admin only</span>
            </AuthorityCheck>
        )

        expect(screen.queryByText('Admin only')).not.toBeInTheDocument()
        expect(container.innerHTML).toBe('')
    })

    it('renders the fallback when the user lacks the capability', () => {
        useAdminAuthStore.setState({role: 'VIEWER'})

        render(
            <AuthorityCheck capability="staff:manage" fallback={<span>No access</span>}>
                <span>Staff panel</span>
            </AuthorityCheck>
        )

        expect(screen.queryByText('Staff panel')).not.toBeInTheDocument()
        expect(screen.getByText('No access')).toBeInTheDocument()
    })

    it('renders children, not fallback, when the capability is satisfied', () => {
        useAdminAuthStore.setState({role: 'ORDER_MANAGER'})

        render(
            <AuthorityCheck capability="order:write" fallback={<span>Denied</span>}>
                <span>Order actions</span>
            </AuthorityCheck>
        )

        expect(screen.getByText('Order actions')).toBeInTheDocument()
        expect(screen.queryByText('Denied')).not.toBeInTheDocument()
    })

    it('does not render children for a role outside the capability set', () => {
        useAdminAuthStore.setState({role: 'CATALOG_MANAGER'})

        render(
            <AuthorityCheck capability="order:write">
                <span>Order section</span>
            </AuthorityCheck>
        )

        expect(screen.queryByText('Order section')).not.toBeInTheDocument()
    })
})
