import { Container } from '@/primitives/container';

import type { ReactNode } from 'react';


export interface PageLayoutProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function PageLayout({
  title,
  description,
  action,
  children,
  size = 'lg',
}: PageLayoutProps) {
  return (
    <Container size={size} padded={false} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--c-text)">{title}</h1>
          {description && (
            <p className="text-sm text-(--c-text-muted) mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="fade-in">{children}</div>
    </Container>
  );
}
