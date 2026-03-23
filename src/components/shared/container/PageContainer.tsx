import type {ReactNode} from 'react';
import {AdaptiveCard} from "@/components";

interface PageContainerProps {
    title?: string
    description?: string
    children: ReactNode
    action?: ReactNode
}

export function PageContainer({
                                  title,
                                  description,
                                  children,
                                  action,
                              }: PageContainerProps) {
    return (
        <div className="w-full space-y-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-admin-text">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-admin-text-muted">
                            {description}
                        </p>
                    )}
                </div>

                {action && <div className="shrink-0">{action}</div>}
            </div>

            <div className="fade-in">
                <AdaptiveCard>{children}</AdaptiveCard>
            </div>
        </div>
    )
}