import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {ImageGallery} from '../ImageGallery'

describe('ImageGallery', () => {
    it('bounds the desktop gallery while retaining a fluid mobile width', () => {
        render(
            <ImageGallery
                productName="Safety shirt"
                images={[
                    {id: 'image-1', imageUrl: 'products/safety-shirt.jpg', featured: true, sortOrder: 0},
                ]}
            />,
        )

        expect(screen.getByRole('img', {name: 'Safety shirt'}).parentElement?.parentElement).toHaveClass(
            'w-full',
            'max-w-lg',
            'mx-auto',
        )
    })
})
