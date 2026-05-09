import {clsx} from 'clsx';
import * as React from "react";

type DropdownMenuProps = {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "left" | "right";
};

export function DropdownMenu({trigger, children, align = "right"}: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded-lg"
            >
                {trigger}
            </button>

            {open && (
                <div
                    className={clsx(
                        "absolute mt-2 min-w-[12rem] rounded-xl border border-slate-200 bg-white shadow-lg p-1",
                        align === "right" ? "right-0" : "left-0"
                    )}
                    role="menu"
                >
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownItem({
                                 children,
                                 onClick,
                                 destructive,
                             }: {
    children: React.ReactNode;
    onClick?: () => void;
    destructive?: boolean;
}) {
    return (
        <button
            type="button"
            role="menuitem"
            onClick={onClick}
            className={clsx(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition",
                destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-100"
            )}
        >
            {children}
        </button>
    );
}