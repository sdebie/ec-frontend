import {Link} from 'react-router-dom';
import type {PromoGridColumns, PromoGridSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: PromoGridSectionProps;
}

const gridClassByColumns: Record<PromoGridColumns, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export const PromoGridSection = ({props}: Props) => {
    const layout = props.layout ?? 'cards';
    const columns = props.columns ?? 3;
    const gridClass = gridClassByColumns[columns];

    return (
        <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8">
            <header>
                <h2 className="text-2xl font-semibold">{props.title}</h2>
                {props.subtitle ? <p className="mt-2 text-(--sf-muted-text)">{props.subtitle}</p> : null}
            </header>

            {props.items.length === 0 ? (
                <p className="mt-6 text-sm text-(--sf-muted-text)">Promotions will appear here soon.</p>
            ) : (
                <div className={`mt-6 grid gap-4 ${gridClass}`}>
                    {props.items.map((item, index) => {
                        const isFeatureCard =
                            layout === 'feature-first' && index === 0 && columns >= 3;

                        return (
                            <article
                                key={item.id}
                                className={[
                                    'rounded-xl border border-(--sf-border) bg-(--sf-bg) p-5 sm:p-6',
                                    'transition hover:border-(--sf-accent)',
                                    isFeatureCard ? 'sm:col-span-2' : '',
                                ].join(' ')}
                            >
                                {item.eyebrow ? (
                                    <p className="text-xs font-medium uppercase tracking-wide text-(--sf-muted-text)">
                                        {item.eyebrow}
                                    </p>
                                ) : null}

                                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>

                                {item.description ? (
                                    <p className="mt-2 text-sm leading-6 text-(--sf-muted-text)">
                                        {item.description}
                                    </p>
                                ) : null}

                                {item.cta ? (
                                    <div className="mt-5">
                                        <Link
                                            to={item.cta.to}
                                            className="inline-flex rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-[var(--sf-accent-text)]"
                                        >
                                            {item.cta.label}
                                        </Link>
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};
