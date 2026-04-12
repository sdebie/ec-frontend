import {ReactNode} from 'react'

interface CategoryCardProps {
    name: string
    description?: string
    image?: string
    icon?: ReactNode
    href: string
    onClick?: () => void
}

/**
 * CategoryCard
 * Card component for displaying product categories
 * Can use image or icon, fully theme-aware
 */
export function CategoryCard({
                                 name,
                                 description,
                                 image,
                                 icon,
                                 href,
                                 onClick,
                             }: CategoryCardProps) {
    return (
        <a
            href={href}
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault()
                    onClick()
                }
            }}
            className="group block rounded-lg overflow-hidden transition-all hover:shadow-lg"
            style={{
                backgroundColor: 'var(--storefront-color-surface)',
                border: '1px solid var(--storefront-color-border)',
            }}
        >
            {/* Image or Icon Area */}
            <div
                className="relative h-40 flex items-center justify-center overflow-hidden"
                style={{
                    backgroundColor: 'var(--storefront-color-background)',
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : icon ? (
                    <div className="text-4xl text-opacity-50 group-hover:text-opacity-100 transition-all"
                         style={{color: 'var(--storefront-color-primary)'}}>
                        {icon}
                    </div>
                ) : (
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: 'var(--storefront-color-primary)',
                            opacity: 0.1,
                        }}
                    />
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3
                    className="font-semibold text-lg mb-1"
                    style={{
                        color: 'var(--storefront-color-text-primary)',
                        fontFamily: 'var(--storefront-font-heading)',
                    }}
                >
                    {name}
                </h3>
                {description && (
                    <p
                        className="text-sm"
                        style={{
                            color: 'var(--storefront-color-text-secondary)',
                        }}
                    >
                        {description}
                    </p>
                )}
            </div>
        </a>
    )
}

export default CategoryCard

