import type {BenefitsSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: BenefitsSectionProps;
}

export const BenefitsSection = ({props}: Props) => {
    return (
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-panel)] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{props.title}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                {props.items.map((item) => (
                    <article
                        key={item.title}
                        className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4"
                    >
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="mt-2 text-sm text-[var(--sf-muted-text)]">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
};
