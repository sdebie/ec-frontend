import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

type UvhProductAccordionProps = {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
};

export function UvhProductAccordion({ title, defaultOpen = false, children }: UvhProductAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-(--sf-border)">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between py-4 text-left"
                aria-expanded={open}
            >
                <span className="text-sm font-semibold text-(--sf-text)">{title}</span>
                {open ? (
                    <Minus className="h-4 w-4 shrink-0 text-(--sf-accent)" />
                ) : (
                    <Plus className="h-4 w-4 shrink-0 text-(--sf-muted-text)" />
                )}
            </button>
            {open ? <div className="pb-5">{children}</div> : null}
        </div>
    );
}
