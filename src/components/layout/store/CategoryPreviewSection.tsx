import {Link} from 'react-router-dom';
import type {
    CategoryPreviewColumns,
    CategoryPreviewItem,
    CategoryPreviewSectionProps,
} from '@/types/storefront/storefrontTypes';

interface Props {
    props: CategoryPreviewSectionProps;
}

const gridClassByColumns: Record<CategoryPreviewColumns, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    6: 'sm:grid-cols-3 lg:grid-cols-6',
};

const CategoryLink = ({item, className, children}: {
    item: CategoryPreviewItem;
    className: string;
    children: React.ReactNode;
}) => {
    if (item.external) {
        return (
            <a href={item.to} target="_blank" rel="noreferrer" className={className}>
                {children}
            </a>
        );
    }

    return (
        <Link to={item.to} className={className}>
            {children}
        </Link>
    );
};

export const CategoryPreviewSection = ({props}: Props) => {
    const layout = props.layout ?? 'tiles';
    const columns = props.columns ?? 4;
    const gridClass = gridClassByColumns[columns];

    return (
        <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8">
            <header>
                <h2 className="text-2xl font-semibold">{props.title}</h2>
                {props.subtitle ? <p className="mt-2 text-(--sf-muted-text)">{props.subtitle}</p> : null}
            </header>

            {props.items.length === 0 ? (
                <p className="mt-6 text-sm text-(--sf-muted-text)">Categories will appear here soon.</p>
            ) : layout === 'list' ? (
                <ul className="mt-6 divide-y divide-(--sf-border) rounded-xl border border-(--sf-border) bg-(--sf-bg)">
                    {props.items.map((item) => (
                        <li key={item.id}>
                            <CategoryLink
                                item={item}
                                className="flex items-start justify-between gap-4 p-4 transition hover:bg-(--sf-panel) sm:p-5"
                            >
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    {item.description ? (
                                        <p className="mt-1 text-sm text-(--sf-muted-text)">{item.description}</p>
                                    ) : null}
                                </div>
                                <span className="text-sm font-medium text-(--sf-accent)">Shop now</span>
                            </CategoryLink>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={`mt-6 grid gap-4 ${gridClass}`}>
                    {props.items.map((item) => (
                        <CategoryLink
                            key={item.id}
                            item={item}
                            className="group overflow-hidden rounded-xl border border-[var(--sf-border)] bg-[var(--sf-bg)] transition hover:border-[var(--sf-accent)]"
                        >
                            {item.imageSrc ? (
                                <div
                                    className="aspect-[4/3] w-full overflow-hidden border-b border-[var(--sf-border)] bg-[var(--sf-panel)]">
                                    <img
                                        src={item.imageSrc}
                                        alt={item.imageAlt || item.label}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                </div>
                            ) : null}

                            <div className="p-4">
                                <h3 className="font-medium">{item.label}</h3>
                                {item.description ? (
                                    <p className="mt-1 text-sm text-[var(--sf-muted-text)] line-clamp-2">
                                        {item.description}
                                    </p>
                                ) : null}
                                <p className="mt-3 text-sm font-medium text-[var(--sf-accent)]">Explore</p>
                            </div>
                        </CategoryLink>
                    ))}
                </div>
            )}
        </section>
    );
};
