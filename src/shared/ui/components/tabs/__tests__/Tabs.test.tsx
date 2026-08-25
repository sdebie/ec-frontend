import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Tabs} from '../Tabs'

const {TabList, TabNav, TabContent} = Tabs

function BasicTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
    return (
        <Tabs defaultValue="tab1" {...props}>
            <TabList>
                <TabNav value="tab1">Home</TabNav>
                <TabNav value="tab2">Profile</TabNav>
                <TabNav value="tab3" disabled>
                    Disabled
                </TabNav>
            </TabList>
            <div>
                <TabContent value="tab1">Home content</TabContent>
                <TabContent value="tab2">Profile content</TabContent>
                <TabContent value="tab3">Disabled content</TabContent>
            </div>
        </Tabs>
    )
}

describe('Tabs', () => {
    it('shows the defaultValue panel and hides the others', () => {
        render(<BasicTabs/>)

        expect(screen.getByText('Home content')).toBeVisible()
        expect(screen.getByText('Profile content')).not.toBeVisible()
        expect(screen.getByText('Disabled content')).not.toBeVisible()
    })

    it('switches panels when a tab is clicked (uncontrolled)', async () => {
        const user = userEvent.setup()
        render(<BasicTabs/>)

        await user.click(screen.getByRole('tab', {name: 'Profile'}))

        expect(screen.getByText('Home content')).not.toBeVisible()
        expect(screen.getByText('Profile content')).toBeVisible()
    })

    it('marks the active tab with aria-selected and links tab/panel via id + aria-controls/aria-labelledby', async () => {
        const user = userEvent.setup()
        render(<BasicTabs/>)

        const homeTab = screen.getByRole('tab', {name: 'Home'})
        const profileTab = screen.getByRole('tab', {name: 'Profile'})
        expect(homeTab).toHaveAttribute('aria-selected', 'true')
        expect(profileTab).toHaveAttribute('aria-selected', 'false')

        const homePanel = screen.getByText('Home content').closest('[role="tabpanel"]') as HTMLElement
        expect(homeTab.getAttribute('aria-controls')).toBe(homePanel.id)
        expect(homePanel.getAttribute('aria-labelledby')).toBe(homeTab.id)

        await user.click(profileTab)
        expect(homeTab).toHaveAttribute('aria-selected', 'false')
        expect(profileTab).toHaveAttribute('aria-selected', 'true')
    })

    it('does not switch when a disabled tab is clicked', async () => {
        const user = userEvent.setup()
        render(<BasicTabs/>)

        await user.click(screen.getByRole('tab', {name: 'Disabled'}))

        expect(screen.getByText('Home content')).toBeVisible()
        expect(screen.getByText('Disabled content')).not.toBeVisible()
    })

    it('supports controlled value + onChange, and does not switch on its own when controlled', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        const {rerender} = render(<BasicTabs value="tab1" onChange={onChange}/>)

        await user.click(screen.getByRole('tab', {name: 'Profile'}))

        expect(onChange).toHaveBeenCalledWith('tab2')
        // Controlled: the panel does NOT switch until the parent updates `value`.
        expect(screen.getByText('Home content')).toBeVisible()

        rerender(<BasicTabs value="tab2" onChange={onChange}/>)
        expect(screen.getByText('Profile content')).toBeVisible()
    })

    it('renders an icon inside the tab nav', () => {
        render(
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1" icon={<span data-testid="icon"/>}>
                        Home
                    </TabNav>
                </TabList>
                <TabContent value="tab1">Home content</TabContent>
            </Tabs>,
        )

        expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('applies pill-variant classes to the active tab instead of underline classes', () => {
        render(<BasicTabs variant="pill"/>)

        const homeTab = screen.getByRole('tab', {name: 'Home'})
        expect(homeTab.className).toContain('rounded-full')
        expect(homeTab.className).not.toContain('border-b-2')
    })

    it('never puts overflow-x-auto on the tab list (tabs wrap instead of scrolling)', () => {
        render(<BasicTabs/>)
        expect(screen.getByRole('tablist').className).not.toContain('overflow-x-auto')
    })

    it('throws a clear error when TabNav is rendered outside of Tabs', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
        })
        expect(() => render(<TabNav value="x">Oops</TabNav>)).toThrow('Tabs.TabNav must be rendered inside <Tabs>')
        consoleError.mockRestore()
    })
})
