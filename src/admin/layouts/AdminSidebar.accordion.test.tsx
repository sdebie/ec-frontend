import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {AdminSidebar} from './AdminSidebar'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

// Scoped to its own mock (rather than reusing AdminSidebar.test.tsx's) because
// accordion behaviour needs at least two submenu-bearing top-level routes,
// which the other file's mock doesn't have and shouldn't be grown just for this.
vi.mock('@/admin/hooks/useClientName', () => ({
    useClientName: () => 'Test Client',
}))

vi.mock('@/admin/routes/adminMenuRoutes.config', () => ({
    adminMenuRoutes: [
        {
            key: 'group-a',
            path: '/admin/group-a',
            authority: ['SUPER_ADMIN'],
            meta: {
                label: 'Group A',
                section: 'MAIN',
                pageBackgroundType: 'plain',
                pageContainerType: 'contained',
                icon: 'store'
            },
            subMenu: [
                {
                    key: 'group-a-child',
                    path: '/admin/group-a/child',
                    authority: ['SUPER_ADMIN'],
                    meta: {label: 'Group A Child', pageBackgroundType: 'plain', pageContainerType: 'contained'},
                },
            ],
        },
        {
            key: 'group-b',
            path: '/admin/group-b',
            authority: ['SUPER_ADMIN'],
            meta: {
                label: 'Group B',
                section: 'MAIN',
                pageBackgroundType: 'plain',
                pageContainerType: 'contained',
                icon: 'users'
            },
            subMenu: [
                {
                    key: 'group-b-child',
                    path: '/admin/group-b/child',
                    authority: ['SUPER_ADMIN'],
                    meta: {label: 'Group B Child', pageBackgroundType: 'plain', pageContainerType: 'contained'},
                },
            ],
        },
    ],
}))

function renderSidebar(initialPath = '/admin/group-a/child') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <AdminSidebar
                isOpen={false}
                onClose={vi.fn()}
                isCollapsed={false}
                onSetCollapsed={vi.fn()}
            />
        </MemoryRouter>,
    )
}

describe('AdminSidebar accordion behaviour', () => {
    beforeEach(() => {
        useAdminAuthStore.setState({authority: ['SUPER_ADMIN']})
    })

    it('auto-expands the group containing the active route on load, leaving the other collapsed', () => {
        renderSidebar('/admin/group-a/child')

        expect(screen.getByText('Group A Child')).toBeInTheDocument()
        expect(screen.queryByText('Group B Child')).not.toBeInTheDocument()
    })

    it('collapses the previously open group when a different group is opened', async () => {
        const user = userEvent.setup()
        renderSidebar('/admin/group-a/child')

        expect(screen.getByText('Group A Child')).toBeInTheDocument()

        await user.click(screen.getByText('Group B'))

        expect(screen.getByText('Group B Child')).toBeInTheDocument()
        expect(screen.queryByText('Group A Child')).not.toBeInTheDocument()
    })

    it('toggles a group closed when its own header is clicked again', async () => {
        const user = userEvent.setup()
        renderSidebar('/admin/group-a/child')

        expect(screen.getByText('Group A Child')).toBeInTheDocument()

        await user.click(screen.getByText('Group A'))

        expect(screen.queryByText('Group A Child')).not.toBeInTheDocument()
    })
})
