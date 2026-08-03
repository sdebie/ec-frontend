/** Hydration failed — the wishlist IDs are intact, only the display data is missing. */
export function WishlistErrorState() {
    return (
        <div className="mt-6 rounded-lg border border-(--sf-border) p-8 text-center">
            <p className="text-(--sf-muted-text)">
                We couldn&apos;t load your wishlist. Please try again.
            </p>
        </div>
    )
}
