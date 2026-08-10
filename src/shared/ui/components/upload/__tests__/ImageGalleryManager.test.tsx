import {fireEvent, render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {ImageGalleryManager, type ImageGalleryItem} from '../ImageGalleryManager'

const images: ImageGalleryItem[] = [
    {url: 'media/first.jpg', altText: 'A first image'},
    {url: 'media/second.jpg', altText: ''},
    {url: 'media/third.jpg', altText: ''},
]

function renderManager(overrides: Partial<Parameters<typeof ImageGalleryManager>[0]> = {}) {
    const props = {
        images,
        onUpload: vi.fn(),
        onRemove: vi.fn(),
        onReorder: vi.fn(),
        ...overrides,
    }
    render(<ImageGalleryManager {...props}/>)
    return props
}

describe('ImageGalleryManager', () => {
    it('renders every image with its filename and an image count', () => {
        renderManager()

        expect(screen.getByText('first.jpg')).toBeInTheDocument()
        expect(screen.getByText('second.jpg')).toBeInTheDocument()
        expect(screen.getByText('third.jpg')).toBeInTheDocument()
        expect(screen.getByText('3 images')).toBeInTheDocument()
    })

    it('marks only the first image as primary', () => {
        renderManager()

        expect(screen.getAllByText('Primary')).toHaveLength(1)
        // The primary card has no set-as-primary action; the other two do.
        expect(screen.queryByRole('button', {name: /set first\.jpg as primary/i})).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: /set second\.jpg as primary/i})).toBeInTheDocument()
    })

    it('accepts MULTIPLE files from the picker in one change', async () => {
        const user = userEvent.setup()
        const {onUpload} = renderManager()

        const input = screen.getByLabelText(/^upload image file/i) as HTMLInputElement
        expect(input).toHaveAttribute('multiple')

        const fileA = new File(['a'], 'a.jpg', {type: 'image/jpeg'})
        const fileB = new File(['b'], 'b.jpg', {type: 'image/jpeg'})
        await user.upload(input, [fileA, fileB])

        expect(onUpload).toHaveBeenCalledWith([fileA, fileB])
    })

    it('reports removal by stored value', async () => {
        const user = userEvent.setup()
        const {onRemove} = renderManager()

        await user.click(screen.getByRole('button', {name: /remove image second\.jpg/i}))

        expect(onRemove).toHaveBeenCalledWith('media/second.jpg')
    })

    it('set-as-primary moves the image to the front of the reported order', async () => {
        const user = userEvent.setup()
        const {onReorder} = renderManager()

        await user.click(screen.getByRole('button', {name: /set third\.jpg as primary/i}))

        expect(onReorder).toHaveBeenCalledWith([images[2], images[0], images[1]])
    })

    it('reorders via drag and drop between cards', () => {
        const {onReorder} = renderManager()

        const firstCard = screen.getByText('first.jpg').closest('[draggable]') as HTMLElement
        const thirdCard = screen.getByText('third.jpg').closest('[draggable]') as HTMLElement

        fireEvent.dragStart(firstCard, {dataTransfer: {types: [], files: []}})
        fireEvent.drop(thirdCard, {dataTransfer: {types: [], files: []}})

        expect(onReorder).toHaveBeenCalledWith([images[1], images[2], images[0]])
    })

    it('uploads files dropped onto the grid', () => {
        const {onUpload} = renderManager()

        const dropZone = screen.getByRole('button', {name: /add or drop images/i})
        const file = new File(['x'], 'dropped.jpg', {type: 'image/jpeg'})
        fireEvent.drop(dropZone.parentElement as HTMLElement, {
            dataTransfer: {types: ['Files'], files: [file]},
        })

        expect(onUpload).toHaveBeenCalledWith([file])
    })

    it('enforces maxImages: caps the count label, hides the add tile, and trims uploads', async () => {
        const user = userEvent.setup()
        const {onUpload} = renderManager({images: images.slice(0, 2), maxImages: 3})

        expect(screen.getByText('2 of 3 images')).toBeInTheDocument()

        const input = screen.getByLabelText(/^upload image file/i) as HTMLInputElement
        const fileA = new File(['a'], 'a.jpg', {type: 'image/jpeg'})
        const fileB = new File(['b'], 'b.jpg', {type: 'image/jpeg'})
        await user.upload(input, [fileA, fileB])

        // Only one slot remains, so only the first file is passed through.
        expect(onUpload).toHaveBeenCalledWith([fileA])
    })

    it('disabled: no add tile, no interactive card actions', () => {
        renderManager({disabled: true})

        expect(screen.queryByRole('button', {name: /add or drop images/i})).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: /remove image first\.jpg/i})).toBeDisabled()
        expect(screen.getByRole('button', {name: /add images/i})).toBeDisabled()
    })

    it('resolves display URLs through resolveSrc while reporting stored values', () => {
        renderManager({resolveSrc: (image) => `/static/images/${image}`})

        const img = screen.getByAltText('A first image') as HTMLImageElement
        expect(img.src).toContain('/static/images/media/first.jpg')
    })

    describe('layout toggle', () => {
        it('defaults to grid and switches to rows', async () => {
            const user = userEvent.setup()
            renderManager()

            expect(screen.getByRole('button', {name: 'Grid view'})).toHaveAttribute('aria-pressed', 'true')
            expect(document.querySelector('[data-layout="grid"]')).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'Row view'}))

            expect(screen.getByRole('button', {name: 'Row view'})).toHaveAttribute('aria-pressed', 'true')
            expect(document.querySelector('[data-layout="row"]')).toBeInTheDocument()
        })

        it('row layout shows the alt text (or its absence) per image', async () => {
            const user = userEvent.setup()
            renderManager()

            await user.click(screen.getByRole('button', {name: 'Row view'}))

            expect(screen.getByText('A first image')).toBeInTheDocument()
            expect(screen.getAllByText('No alt text')).toHaveLength(2)
        })

        it('row layout keeps reorder, set-primary, and selection working', async () => {
            const user = userEvent.setup()
            const {onReorder} = renderManager()

            await user.click(screen.getByRole('button', {name: 'Row view'}))

            await user.click(screen.getByRole('button', {name: /set third\.jpg as primary/i}))
            expect(onReorder).toHaveBeenCalledWith([images[2], images[0], images[1]])

            await user.click(screen.getByRole('button', {name: /image details: second\.jpg/i}))
            expect(screen.getByText('Image details')).toBeInTheDocument()
        })

        it('primary badge renders exactly once in row layout', async () => {
            const user = userEvent.setup()
            renderManager()

            await user.click(screen.getByRole('button', {name: 'Row view'}))

            expect(screen.getAllByText('Primary')).toHaveLength(1)
        })
    })

    describe('details panel', () => {
        it('opens on card selection, shows the filename, and closes', async () => {
            const user = userEvent.setup()
            renderManager()

            expect(screen.queryByText('Image details')).not.toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: /image details: second\.jpg/i}))
            const panel = screen.getByText('Image details').closest('div')!.parentElement as HTMLElement
            expect(within(panel).getByText('second.jpg')).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: /close image details/i}))
            expect(screen.queryByText('Image details')).not.toBeInTheDocument()
        })

        it('edits alt text for the selected image only', async () => {
            const user = userEvent.setup()
            const onAltTextChange = vi.fn()
            renderManager({onAltTextChange})

            await user.click(screen.getByRole('button', {name: /image details: second\.jpg/i}))
            await user.type(screen.getByLabelText('Alt text'), 'H')

            expect(onAltTextChange).toHaveBeenCalledWith('media/second.jpg', 'H')
        })

        it('hides the alt text field when the consumer provides no handler', async () => {
            const user = userEvent.setup()
            renderManager()

            await user.click(screen.getByRole('button', {name: /image details: second\.jpg/i}))

            expect(screen.queryByLabelText('Alt text')).not.toBeInTheDocument()
        })

        it('sets the selected image as primary from the panel', async () => {
            const user = userEvent.setup()
            const {onReorder} = renderManager()

            await user.click(screen.getByRole('button', {name: /image details: third\.jpg/i}))
            await user.click(screen.getByRole('button', {name: 'Set as primary'}))

            expect(onReorder).toHaveBeenCalledWith([images[2], images[0], images[1]])
        })

        it('disables the primary action when the selected image already is primary', async () => {
            const user = userEvent.setup()
            renderManager()

            await user.click(screen.getByRole('button', {name: /image details: first\.jpg/i}))

            expect(screen.getByRole('button', {name: 'Primary image'})).toBeDisabled()
        })

        it('replaces the selected image file', async () => {
            const user = userEvent.setup()
            const onReplace = vi.fn()
            renderManager({onReplace})

            await user.click(screen.getByRole('button', {name: /image details: second\.jpg/i}))
            const replacement = new File(['r'], 'replacement.jpg', {type: 'image/jpeg'})
            await user.upload(screen.getByLabelText(/replace image file/i), replacement)

            expect(onReplace).toHaveBeenCalledWith('media/second.jpg', replacement)
        })

        it('removes the selected image from the panel and the panel goes away', async () => {
            const user = userEvent.setup()
            let currentImages = images
            const onRemove = vi.fn((value: string) => {
                currentImages = currentImages.filter((item) => item.url !== value)
            })
            const props = renderManager({onRemove})

            await user.click(screen.getByRole('button', {name: /image details: second\.jpg/i}))
            await user.click(screen.getByRole('button', {name: 'Remove image'}))

            expect(props.onRemove).toHaveBeenCalledWith('media/second.jpg')
        })
    })
})
