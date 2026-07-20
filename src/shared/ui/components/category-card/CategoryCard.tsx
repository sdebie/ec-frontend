import { Link } from 'react-router-dom'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export interface CategoryCardProps {
  name: string
  description?: string
  image?: string
  icon?: ReactNode
  href: string
  onClick?: () => void
  className?: string
}

/**
 * CategoryCard
 * Card component for displaying product categories.
 * Can use image or icon, fully theme-aware.
 */
export function CategoryCard({
  name,
  description,
  image,
  icon,
  href,
  onClick,
  className,
}: CategoryCardProps) {
  const isExternal = /^(https?:|mailto:|tel:|\/\/)/i.test(href)

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  const cardContent = (
    <>
      {/* Image or Icon Area */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden bg-(--c-bg)">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : icon ? (
          <div className="text-4xl opacity-50 group-hover:opacity-100 transition-all text-(--c-accent)">
            {icon}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-(--c-accent) opacity-10" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-(--c-text)">{name}</h3>
        {description && (
          <p className="text-sm text-(--c-text-muted)">{description}</p>
        )}
      </div>
    </>
  )

  const sharedClassName = cn(
    'group block rounded-lg overflow-hidden transition-all hover:shadow-lg bg-(--c-panel) border border-(--c-border)',
    className
  )

  if (isExternal) {
    return (
      <a href={href} onClick={handleClick} className={sharedClassName}>
        {cardContent}
      </a>
    )
  }

  return (
    <Link to={href} onClick={handleClick} className={sharedClassName}>
      {cardContent}
    </Link>
  )
}

export default CategoryCard
