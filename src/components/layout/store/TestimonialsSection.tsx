import type {TestimonialsColumns, TestimonialsSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: TestimonialsSectionProps;
}

const gridClassByColumns: Record<TestimonialsColumns, string> = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
};

export const TestimonialsSection = ({props}: Props) => {
    const layout = props.layout ?? 'grid';
    const columns = props.columns ?? 3;
    const gridClass = gridClassByColumns[columns];

    return (
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-panel)] p-6 sm:p-8">
            <header>
                <h2 className="text-2xl font-semibold">{props.title}</h2>
                {props.subtitle ? <p className="mt-2 text-[var(--sf-muted-text)]">{props.subtitle}</p> : null}
            </header>

            {props.items.length === 0 ? (
                <p className="mt-6 text-sm text-[var(--sf-muted-text)]">Customer testimonials coming soon.</p>
            ) : (
                <div
                    className={[
                        'mt-6 grid gap-4',
                        layout === 'stacked' ? 'grid-cols-1' : gridClass,
                    ].join(' ')}
                >
                    {props.items.map((item) => (
                        <article
                            key={item.id}
                            className="rounded-xl border border-[var(--sf-border)] bg-[var(--sf-bg)] p-5 sm:p-6"
                        >
                            <blockquote className="text-base leading-7">
                                <p>{item.quote}</p>
                            </blockquote>

                            <footer className="mt-5 border-t border-[var(--sf-border)] pt-4">
                                <p className="font-medium">{item.name}</p>
                                {item.role || item.company ? (
                                    <p className="mt-1 text-sm text-[var(--sf-muted-text)]">
                                        {[item.role, item.company].filter(Boolean).join(', ')}
                                    </p>
                                ) : null}
                            </footer>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};
