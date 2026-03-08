import {cn} from "@/utils/cn.ts";
import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({className, required, children, ...props}, ref) => {
        return (
            <label
                ref={ref}
                className={cn(
                    'block text-sm font-medium text-admin-text mb-1.5',
                    className
                )}
                {...props}
            >
                {children}
                {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            </label>
        );
    }
);
Label.displayName = 'Label';