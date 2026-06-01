import {cn} from '@/utils/cn.ts';
import type {ReactNode} from 'react';

interface IconBoxProps {
    children: ReactNode;
    className?: string;
}

export function IconBox({children, className}: IconBoxProps) {
    return (
        <div
            className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) text-(--c-accent)',
                className
            )}
        >
            {children}
        </div>
    );
}
