import {Heart} from 'lucide-react'
import {Link} from 'react-router-dom'

/** Nothing saved yet — offers the way back into the catalogue. */
export function WishlistEmptyState() {
    return (
        <div className="mt-6 rounded-lg border border-(--sf-border) p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-(--sf-muted-text)"/>
            <p className="mt-3 text-(--sf-muted-text)">Your wishlist is empty</p>
            <Link
                to="/products"
                className="mt-3 inline-block text-sm font-medium text-(--sf-accent) hover:opacity-80"
            >
                Browse products
            </Link>
        </div>
    )
}
