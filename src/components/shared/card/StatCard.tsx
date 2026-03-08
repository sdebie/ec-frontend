import type {ReactNode} from 'react';
import {cn} from "@/utils/cn.ts";

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    icon?: ReactNode;
}

export function StatCard({title, value, trend, trendDirection, icon}: StatCardProps) {
    return (
        <div
            className="bg-admin-panel border border-admin-border p-6 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-admin-text-muted mb-1">{title}</p>
                    <div className="text-2xl font-bold text-admin-text tracking-tight">{value}</div>

                    {trend && (
                        <div className="mt-2 flex items-center text-sm">
              <span
                  className={cn(
                      'font-medium mr-2',
                      trendDirection === 'up' && 'text-emerald-500',
                      trendDirection === 'down' && 'text-red-500',
                      trendDirection === 'neutral' && 'text-gray-500'
                  )}
              >
                {trend}
              </span>
                            <span className="text-admin-text-muted">vs last month</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 bg-primary-subtle text-primary rounded-lg">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
