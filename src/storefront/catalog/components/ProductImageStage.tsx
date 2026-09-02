import {Link} from 'react-router-dom'
import {SF_FOCUS_RING} from '@/storefront/sections/shared'

/**
 * The "no image" mark, and the single definition of it.
 *
 * A shared definition is what keeps the placeholder from drifting into a
 * different size or colour across the stages that use it while still
 * looking deliberate.
 *
 * The surface behind it belongs to the caller — every stage that uses this
 * already sets `bg-(--sf-surface-muted)` on the box it fills, so painting it
 * here too would be a second place to change one colour.
 */
export function ProductImagePlaceholder({className = 'h-12 w-12'}: {className?: string}) {
    return (
        <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
            </svg>
        </div>
    )
}

export interface ProductImageStageProps {
    /** Already resolved to a servable URL, or null when the product has no image. */
    imageUrl: string | null
    alt: string
    productUrl: string
    /**
     * Responsive padding around the image. The row rail is narrower than the grid
     * stage, so it insets less — the only thing that actually differs between the
     * two layouts.
     */
    padding: string
}

/**
 * The linked image inside a product card: picture or placeholder, wrapped in
 * the navigation target.
 *
 * Shared between both `ProductCard` layout branches (which differ only in
 * padding) so a change to the hover transform, the focus ring or the
 * placeholder is made once rather than risking the two drifting apart.
 */
export function ProductImageStage({imageUrl, alt, productUrl, padding}: ProductImageStageProps) {
    return (
        <Link to={productUrl} className={`block h-full w-full ${SF_FOCUS_RING.page} rounded-sm`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={alt}
                    loading="lazy"
                    className={`h-full w-full object-contain ${padding} transition-transform group-hover:scale-105`}
                />
            ) : (
                <ProductImagePlaceholder/>
            )}
        </Link>
    )
}
