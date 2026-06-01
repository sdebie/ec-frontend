import * as React from 'react';

import { cn } from '@/utils/cn.ts';

export interface PresetSegmentItemOptionProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PresetSegmentItemOption: React.FC<PresetSegmentItemOptionProps> = ({
  label,
  description,
  icon,
  selected,
  disabled,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-lg border-2 bg-(--c-panel) px-4 py-3 text-left transition-all',
        selected
          ? 'border-primary bg-primary-subtle'
          : 'border-(--c-border) hover:border-primary hover:bg-(--c-bg)',
        disabled && 'opacity-50 cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-(--c-bg)',
        className
      )}
    >
      {icon && (
        <div className={cn('shrink-0 mt-0.5', selected ? 'text-primary' : 'text-(--c-text-muted)')}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-(--c-text)')}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-(--c-text-muted) mt-1">{description}</p>
        )}
      </div>
    </button>
  );
};


