import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/cn.ts';

interface PageBackButtonProps {
    /** Custom label for the back button. Defaults to 'Back' */
    label?: string;
    /** Additional CSS classes to apply to the button */
    className?: string;
    /** Custom click handler. If not provided, navigates to previous page using navigate(-1) */
    onClick?: () => void;
}

/**
 * A reusable back navigation button component.
 *
 * Displays a chevron icon with a "Back" label (customizable) that navigates to the previous page.
 * Designed to be placed at the top of edit/create pages, above the page title.
 *
 * @example
 * ```tsx
 * // Basic usage - navigates back one page in history
 * <PageBackButton />
 *
 * // Custom label
 * <PageBackButton label="Return to List" />
 *
 * // Custom click handler
 * <PageBackButton onClick={() => navigate('/admin/products')} />
 * ```
 */
export function PageBackButton({ label = 'Back', className, onClick }: PageBackButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "inline-flex items-center gap-2 text-sm font-medium",
                "text-admin-text-muted hover:text-admin-text",
                "transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md px-2 py-1 -ml-2",
                className
            )}
        >
            <ChevronLeft className="h-4 w-4" />
            <span>{label}</span>
        </button>
    );
}


