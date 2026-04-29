interface SfAboutSectionProps {
  title: string;
  body: string;
}

export function SfAboutSection({ title, body }: SfAboutSectionProps) {
  return (
    <section className="rounded-[var(--sf-radius)] border border-(--sf-border) bg-(--sf-panel) p-6 shadow-[var(--sf-shadow-sm)]">
      <h2 className="text-2xl font-semibold tracking-tight text-(--sf-text)">{title}</h2>
      <p className="mt-3 leading-7 text-(--sf-muted-text)">{body}</p>
    </section>
  );
}

