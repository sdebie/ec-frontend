import { Card } from '@/primitives/card';

interface AboutSectionProps {
  title: string;
  body: string;
}

export function AboutSection({ title, body }: AboutSectionProps) {
  return (
    <Card elevation="sm" className="space-y-3 px-6 py-6">
      <h2 className="text-2xl font-semibold text-(--c-text)">{title}</h2>
      <p className="text-sm leading-7 text-(--c-text-muted)">{body}</p>
    </Card>
  );
}
