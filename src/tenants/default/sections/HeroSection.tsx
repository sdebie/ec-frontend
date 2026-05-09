import { Card } from '@/primitives/card';

import type { ReactNode } from 'react';


interface HeroSectionProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function HeroSection({ title, subtitle, actions }: HeroSectionProps) {
  return (
    <Card elevation="sm" className="px-6 py-7 sm:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-(--c-text)">{title}</h1>
          {subtitle && <p className="max-w-3xl text-sm text-(--c-text-muted)">{subtitle}</p>}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </Card>
  );
}
