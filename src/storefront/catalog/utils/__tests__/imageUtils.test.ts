import {describe, expect, it} from 'vitest'
import {parseAttributes, pickFeaturedImage, type ProductImage} from '../imageUtils'

describe('pickFeaturedImage', () => {
    it('returns null when images array is empty', () => {
        expect(pickFeaturedImage([])).toBeNull()
    })

    it('returns the featured image URL when a featured image is present', () => {
        const images: ProductImage[] = [
            {imageUrl: 'https://cdn.example.com/img1.jpg', featured: false, sortOrder: 1},
            {imageUrl: 'https://cdn.example.com/featured.jpg', featured: true, sortOrder: 3},
            {imageUrl: 'https://cdn.example.com/img2.jpg', featured: false, sortOrder: 2},
        ]

        expect(pickFeaturedImage(images)).toBe('https://cdn.example.com/featured.jpg')
    })

    it('returns the image with lowest sortOrder when no featured image exists', () => {
        const images: ProductImage[] = [
            {imageUrl: 'https://cdn.example.com/img3.jpg', featured: false, sortOrder: 5},
            {imageUrl: 'https://cdn.example.com/img1.jpg', featured: false, sortOrder: 1},
            {imageUrl: 'https://cdn.example.com/img2.jpg', featured: false, sortOrder: 3},
        ]

        expect(pickFeaturedImage(images)).toBe('https://cdn.example.com/img1.jpg')
    })
})

describe('parseAttributes', () => {
    it('parses valid JSON into a record object', () => {
        const json = '{"color":"red","size":"XL"}'

        expect(parseAttributes(json)).toEqual({color: 'red', size: 'XL'})
    })

    it('returns an empty object for malformed JSON', () => {
        const malformed = '{color: red, broken'

        expect(parseAttributes(malformed)).toEqual({})
    })
})
