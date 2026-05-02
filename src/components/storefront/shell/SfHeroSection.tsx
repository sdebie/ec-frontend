import type {ReactNode} from 'react';

interface SfHeroSectionProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function SfHeroSection({title, subtitle, actions}: SfHeroSectionProps) {
    return (
        <section
            className="rounded-(--sf-radius) border border-(--sf-border) bg-(--sf-panel) p-8 shadow-(--sf-shadow-lg) md:p-12">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-(--sf-text) md:text-5xl">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="mt-4 text-base text-(--sf-muted-text) md:text-lg">{subtitle}</p>
                ) : null}
                {actions ? <div className="mt-6 flex justify-center gap-3">{actions}</div> : null}
            </div>
        </section>
    );
}

