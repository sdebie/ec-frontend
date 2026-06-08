import * as React from 'react';
import {cn} from '@/utils/cn.ts';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
}

export function Divider({className, ...props}: DividerProps) {
    return (
        <hr
            className={cn('h-px border-0 bg-(--c-border)', className)}
            {...props}
        />
    );
}
