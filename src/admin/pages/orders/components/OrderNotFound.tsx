import {Link} from 'react-router-dom'
import {Card} from '@/shared/ui/primitives'

/**
 * Shown when the id in the URL resolves to nothing — a deleted order, a mistyped link, or
 * one belonging to a store this staff member cannot see. It offers the way back rather
 * than leaving the reader on an empty page.
 */
export function OrderNotFound() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-8">
            <Card className="w-full max-w-md p-8 text-center">
                <h2 className="mb-2 text-xl font-semibold text-(--c-text)">
                    Not Found
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-(--c-text-muted)">
                    Order not found
                </p>
                <Link
                    to="/admin/orders"
                    className="inline-block rounded-lg bg-(--c-accent) px-5 py-2.5 text-sm font-medium text-(--c-accent-text) transition-opacity hover:opacity-80"
                >
                    Back to orders
                </Link>
            </Card>
        </div>
    )
}
