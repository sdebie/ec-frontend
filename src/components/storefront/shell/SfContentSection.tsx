import type { ReactNode } from 'react';

interface SfContentSectionProps {
  title: string;
  children: ReactNode;
}

export function SfContentSection({ title, children }: SfContentSectionProps) {
  return (
    <section className="rounded-[var(--sf-radius)] border border-(--sf-border) bg-(--sf-panel) p-6 shadow-[var(--sf-shadow-sm)]">
      <h3 className="text-xl font-semibold tracking-tight text-(--sf-text)">{title}</h3>
      <div className="mt-4 text-(--sf-muted-text)">{children}</div>
    </section>
  );
}

