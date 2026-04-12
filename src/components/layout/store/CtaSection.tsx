import {Link} from 'react-router-dom';
import type {CtaSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: CtaSectionProps;
}

export const CtaSection = ({props}: Props) => {
    return (
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-panel)] p-6 text-center sm:p-10">
            <h2 className="text-2xl font-semibold">{props.title}</h2>
            {props.description ? (
                <p className="mx-auto mt-3 max-w-2xl text-[var(--sf-muted-text)]">{props.description}</p>
            ) : null}
            <div className="mt-6">
                <Link
                    to={props.cta.to}
                    className="inline-flex rounded-md bg-[var(--sf-accent)] px-5 py-2.5 font-medium text-[var(--sf-accent-text)]"
                >
                    {props.cta.label}
                </Link>
            </div>
        </section>
    );
};

