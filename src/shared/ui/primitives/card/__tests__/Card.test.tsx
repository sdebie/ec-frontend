import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {Card} from '../Card'

describe('Card', () => {
    describe('variant classes', () => {
        it('renders panel classes by default (shadow, no border)', () => {
            const {container} = render(<Card data-testid="card">Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).toContain('bg-(--c-panel)')
            expect(el.className).toContain('shadow-(--c-shadow-sm)')
            expect(el.className).toContain('text-(--c-text)')
            expect(el.className).toContain('rounded-(--c-radius)')
            expect(el.className).not.toContain('border')
        })

        it('variant="panel" renders shadow without border', () => {
            const {container} = render(<Card variant="panel">Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).toContain('bg-(--c-panel)')
            expect(el.className).toContain('shadow-(--c-shadow-sm)')
            expect(el.className).not.toContain('border')
        })

        it('variant="bordered" renders border without shadow', () => {
            const {container} = render(<Card variant="bordered">Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).toContain('bg-(--c-panel)')
            expect(el.className).toContain('border')
            expect(el.className).toContain('border-(--c-border)')
            expect(el.className).not.toContain('shadow')
        })

        it('variant="plain" renders neither border nor shadow nor background', () => {
            const {container} = render(<Card variant="plain">Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).toContain('text-(--c-text)')
            expect(el.className).toContain('rounded-(--c-radius)')
            expect(el.className).not.toContain('bg-(--c-panel)')
            expect(el.className).not.toContain('shadow')
            expect(el.className).not.toContain('border')
        })
    })

    describe('clickable', () => {
        it('adds cursor-pointer when clickable=true', () => {
            const {container} = render(<Card clickable>Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).toContain('cursor-pointer')
        })

        it('does not add cursor-pointer by default', () => {
            const {container} = render(<Card>Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).not.toContain('cursor-pointer')
        })
    })

    describe('as prop', () => {
        it('renders a div by default', () => {
            const {container} = render(<Card>Content</Card>)
            expect(container.firstElementChild!.tagName).toBe('DIV')
        })

        it('renders a section when as="section"', () => {
            const {container} = render(<Card as="section">Content</Card>)
            expect(container.firstElementChild!.tagName).toBe('SECTION')
        })

        it('renders an article when as="article"', () => {
            const {container} = render(<Card as="article">Content</Card>)
            expect(container.firstElementChild!.tagName).toBe('ARTICLE')
        })

        it('renders an aside when as="aside"', () => {
            const {container} = render(<Card as="aside">Content</Card>)
            expect(container.firstElementChild!.tagName).toBe('ASIDE')
        })
    })

    describe('compound subcomponents', () => {
        it('Card.Header renders with border-b and font-semibold', () => {
            render(
                <Card>
                    <Card.Header>Header Content</Card.Header>
                </Card>
            )
            const header = screen.getByText('Header Content')
            expect(header.className).toContain('border-b')
            expect(header.className).toContain('font-semibold')
            expect(header.className).toContain('border-(--c-border)')
        })

        it('Card.Body renders children with no default styling beyond className', () => {
            render(
                <Card>
                    <Card.Body className="p-4">Body Content</Card.Body>
                </Card>
            )
            const body = screen.getByText('Body Content')
            expect(body.className).toContain('p-4')
        })

        it('Card.Footer renders with border-t', () => {
            render(
                <Card>
                    <Card.Footer>Footer Content</Card.Footer>
                </Card>
            )
            const footer = screen.getByText('Footer Content')
            expect(footer.className).toContain('border-t')
            expect(footer.className).toContain('border-(--c-border)')
        })

        it('all subcomponents render together', () => {
            render(
                <Card>
                    <Card.Header>H</Card.Header>
                    <Card.Body>B</Card.Body>
                    <Card.Footer>F</Card.Footer>
                </Card>
            )
            expect(screen.getByText('H')).toBeInTheDocument()
            expect(screen.getByText('B')).toBeInTheDocument()
            expect(screen.getByText('F')).toBeInTheDocument()
        })
    })

    describe('className merging', () => {
        it('merges caller className onto root element', () => {
            const {container} = render(<Card className="custom-class">Content</Card>)
            const el = container.firstElementChild!
            expect(el.className).toContain('custom-class')
            expect(el.className).toContain('text-(--c-text)')
        })
    })
})
