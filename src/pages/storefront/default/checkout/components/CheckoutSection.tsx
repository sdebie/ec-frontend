import React from 'react';

type Props = {
    step: number;
    title: string;
    children: React.ReactNode;
};

const CheckoutSection: React.FC<Props> = ({step, title, children}) => {
    return (
        <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <header className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-(--sf-accent) text-xs font-semibold text-(--sf-accent-text)">
                    {step}
                </span>
                <h2 className="text-base font-semibold text-(--sf-text)">{title}</h2>
            </header>
            {children}
        </section>
    );
};

export default CheckoutSection;

