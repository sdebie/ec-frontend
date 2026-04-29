import {useId} from 'react';
import {Link} from 'react-router-dom';
import type {NewsletterSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: NewsletterSectionProps;
}

export const NewsletterSection = ({props}: Props) => {
    const layout = props.layout ?? 'inline';
    const emailId = useId();

    return (
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-panel)] p-6 sm:p-8">
            <div className={layout === 'stacked' ? 'mx-auto max-w-2xl text-center' : ''}>
                <h2 className="text-2xl font-semibold">{props.title}</h2>
                {props.description ? (
                    <p className={layout === 'stacked' ? 'mt-3 text-[var(--sf-muted-text)]' : 'mt-2 text-[var(--sf-muted-text)]'}>
                        {props.description}
                    </p>
                ) : null}

                <form
                    className={[
                        'mt-6 gap-3',
                        layout === 'stacked'
                            ? 'mx-auto flex max-w-xl flex-col'
                            : 'flex flex-col sm:flex-row',
                    ].join(' ')}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <label htmlFor={emailId} className="sr-only">
                        Email address
                    </label>
                    <input
                        id={emailId}
                        type="email"
                        name="email"
                        placeholder={props.placeholder || 'Enter your email'}
                        className="w-full rounded-md border border-[var(--sf-border)] bg-[var(--sf-bg)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--sf-accent)]"
                        autoComplete="email"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md bg-[var(--sf-accent)] px-5 py-2.5 text-sm font-medium text-[var(--sf-accent-text)]"
                    >
                        {props.submitLabel}
                    </button>
                </form>

                {props.legalText || props.secondaryLink ? (
                    <div className={layout === 'stacked' ? 'mt-4 text-center' : 'mt-4'}>
                        {props.legalText ? (
                            <p className="text-xs text-[var(--sf-muted-text)]">{props.legalText}</p>
                        ) : null}
                        {props.secondaryLink ? (
                            <p className="mt-2 text-sm">
                                <Link to={props.secondaryLink.to} className="font-medium text-[var(--sf-accent)]">
                                    {props.secondaryLink.label}
                                </Link>
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </section>
    );
};
