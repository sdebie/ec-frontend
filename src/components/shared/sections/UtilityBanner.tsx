import type { ReactNode } from 'react';

interface UtilityBannerProps {
  children: ReactNode;
}

export function UtilityBanner({ children }: UtilityBannerProps) {
  return (
    <div className="rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) px-4 py-3 text-sm text-(--c-text)">
      {children}
    </div>
  );
}
