import { Card } from '@/primitives/card';

import type { ReactNode } from 'react';


interface ContentSectionProps {
  title: string;
  children: ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <Card elevation="sm" className="space-y-4 px-6 py-6">
      <h2 className="text-xl font-semibold text-(--c-text)">{title}</h2>
      <div className="text-sm text-(--c-text-muted)">{children}</div>
    </Card>
  );
}
