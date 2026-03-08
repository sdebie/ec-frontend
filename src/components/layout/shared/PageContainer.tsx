import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function PageContainer({ title, description, children, action }: PageContainerProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-admin-text">{title}</h1>
          {description && (
            <p className="text-sm text-admin-text-muted mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="fade-in">
        {children}
      </div>
    </div>
  );
}
