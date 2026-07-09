import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

export interface PageBackButtonProps {
  /** Custom label for the back button. Defaults to 'Back' */
  label?: string
  /** Additional CSS classes to apply to the button */
  className?: string
  /** Custom click handler. If not provided, navigates to previous page using navigate(-1) */
  onClick?: () => void
}

/**
 * A reusable back navigation button component.
 *
 * Displays a chevron icon with a "Back" label (customizable) that navigates
 * to the previous page. Designed to be placed at the top of edit/create pages,
 * above the page title.
 */
export function PageBackButton({ label = 'Back', className, onClick }: PageBackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 rounded-md px-2 py-1 -ml-2',
        className,
      )}
      style={{
        color: 'var(--c-text-muted)',
      }}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}
