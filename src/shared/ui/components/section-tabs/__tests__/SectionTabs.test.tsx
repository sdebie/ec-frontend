import {useState} from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {SectionTabs, type SectionTabItem} from '../SectionTabs'

function buildSections(overrides: Partial<SectionTabItem>[] = []): SectionTabItem[] {
    const base: SectionTabItem[] = [
        {id: 'one', label: 'First', content: <p>First panel</p>},
        {id: 'two', label: 'Second', content: <input aria-label="Second field"/>},
        {id: 'three', label: 'Third', content: <p>Third panel</p>},
    ]
    return base.map((section, index) => ({...section, ...overrides[index]}))
}

function ControlledWorkspace({sections}: {sections: SectionTabItem[]}) {
    const [active, setActive] = useState(sections[0].id)
    return <SectionTabs sections={sections} activeSectionId={active} onActiveSectionChange={setActive}/>
}

describe('SectionTabs', () => {
    it('renders a tab per section and shows only the active panel', () => {
        render(
            <SectionTabs
                sections={buildSections()}
                activeSectionId="one"
                onActiveSectionChange={vi.fn()}
            />,
        )

        expect(screen.getAllByRole('tab')).toHaveLength(3)

        // Inactive panels hide via visibility (equal-height stacking), which
        // jsdom's CSS-less toBeVisible cannot observe — assert the mechanism:
        // the active panel is interactive, the others are inert + aria-hidden.
        const activePanel = screen.getByText('First panel').closest('[role="tabpanel"]')
        expect(activePanel).not.toHaveAttribute('inert')
        expect(activePanel).not.toHaveAttribute('aria-hidden')

        const inactivePanel = screen.getByText('Third panel').closest('[role="tabpanel"]')
        expect(inactivePanel).toHaveAttribute('inert')
        expect(inactivePanel).toHaveAttribute('aria-hidden', 'true')
    })

    it('keeps inactive panels MOUNTED (invisible), so consumer DOM state survives switches', async () => {
        const user = userEvent.setup()
        render(<ControlledWorkspace sections={buildSections()}/>)

        await user.click(screen.getByRole('tab', {name: 'Second'}))
        await user.type(screen.getByLabelText('Second field'), 'typed value')
        await user.click(screen.getByRole('tab', {name: 'First'}))
        await user.click(screen.getByRole('tab', {name: 'Second'}))

        expect(screen.getByLabelText('Second field')).toHaveValue('typed value')
    })

    it('is controlled: reports the clicked section and marks the active tab selected', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <SectionTabs
                sections={buildSections()}
                activeSectionId="one"
                onActiveSectionChange={onChange}
            />,
        )

        await user.click(screen.getByRole('tab', {name: 'Second'}))

        expect(onChange).toHaveBeenCalledWith('two')
        // Controlled: without the parent updating the prop, selection stays put.
        expect(screen.getByRole('tab', {name: 'First'})).toHaveAttribute('aria-selected', 'true')
    })

    it('never activates a disabled section', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <SectionTabs
                sections={buildSections([{}, {disabled: true}])}
                activeSectionId="one"
                onActiveSectionChange={onChange}
            />,
        )

        const disabledTab = screen.getByRole('tab', {name: 'Second'})
        expect(disabledTab).toBeDisabled()
        await user.click(disabledTab)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('conveys error and complete status with screen-reader text, not colour alone', () => {
        render(
            <SectionTabs
                sections={buildSections([{status: 'error'}, {status: 'complete'}])}
                activeSectionId="one"
                onActiveSectionChange={vi.fn()}
            />,
        )

        expect(screen.getByRole('tab', {name: /First.*has errors/})).toBeInTheDocument()
        expect(screen.getByRole('tab', {name: /Second.*complete/})).toBeInTheDocument()
    })

    it('renders a badge on the section tab', () => {
        render(
            <SectionTabs
                sections={buildSections([{badge: 4}])}
                activeSectionId="one"
                onActiveSectionChange={vi.fn()}
            />,
        )

        expect(within(screen.getByRole('tab', {name: /First/})).getByText('4')).toBeInTheDocument()
    })

    it('moves the selection with arrow keys, skipping disabled sections', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <SectionTabs
                sections={buildSections([{}, {disabled: true}])}
                activeSectionId="one"
                onActiveSectionChange={onChange}
            />,
        )

        screen.getByRole('tab', {name: 'First'}).focus()
        await user.keyboard('{ArrowDown}')

        // 'two' is disabled, so ArrowDown lands on 'three'.
        expect(onChange).toHaveBeenCalledWith('three')
    })

    it('renders header, actions and footer slots', () => {
        render(
            <SectionTabs
                sections={buildSections()}
                activeSectionId="one"
                onActiveSectionChange={vi.fn()}
                header={<h2>Workspace header</h2>}
                actions={<button type="button">Contextual action</button>}
                footer={<button type="button">Footer action</button>}
            />,
        )

        expect(screen.getByRole('heading', {name: 'Workspace header'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Contextual action'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Footer action'})).toBeInTheDocument()
    })

    it('opens the mobile section menu and selects a section from it', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <SectionTabs
                sections={buildSections()}
                activeSectionId="one"
                onActiveSectionChange={onChange}
            />,
        )

        await user.click(screen.getByRole('button', {name: 'Open section menu'}))
        const menu = screen.getByRole('dialog')
        await user.click(within(menu).getByRole('button', {name: 'Third'}))

        expect(onChange).toHaveBeenCalledWith('three')
        // Selecting a section closes the menu.
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})
