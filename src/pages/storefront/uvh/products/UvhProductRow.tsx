import {Link} from 'react-router-dom'
import {IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";

export interface UvhProductRowProps {
    name: string
    description?: string | null
    image?: string | null
    quoteHref?: string
}

/**
 * Mobile-first horizontal product row: image left, title + description + Request Quote.
 * Matches UVH storefront mobile catalogue mockup.
 */
export function UvhProductRow({
    name,
    description,
    image,
    quoteHref = '/contact-us',
}: UvhProductRowProps) {
    const blurb = description?.trim() || 'Request a quote for pricing and availability.'

    return (
        <article className="flex gap-3 border-b border-(--sf-border) py-4 last:border-b-0">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-md border border-(--sf-border) bg-(--sf-surface-muted)">
                {image ? (
                    <img
                        alt={name}
                        className="h-24 w-24 object-cover"
                        src={`${IMAGE_THUMBNAIL_URL}${image}`}
                        onLoad={() => console.log("Image loaded:", `${IMAGE_THUMBNAIL_URL}${image}`)}
                        onError={(event) => {
                            console.error("Image failed:", event.currentTarget.src)
                        }}
                    />
                ) : (
                    <div
                        aria-hidden
                        className="flex size-full items-center justify-center text-(--sf-muted-text)"
                    >
                        <svg
                            className="size-10 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.25}
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className="text-base font-semibold leading-snug text-(--sf-text)">{name}</h3>
                <p className="text-sm leading-relaxed text-(--sf-muted-text) line-clamp-3">{blurb}</p>
                <Link
                    className="mt-1 inline-flex w-fit items-center justify-center rounded-md bg-(--sf-text) px-4 py-2 text-sm font-semibold text-(--sf-panel) transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring)"
                    to={quoteHref}
                >
                    Request Quote
                </Link>
            </div>
        </article>
    )
}
