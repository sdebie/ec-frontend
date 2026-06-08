import {ChevronDown, ChevronUp} from 'lucide-react';
import {cn} from '@/utils/cn.ts';
import Icon from '../../shared/icon/Icon';
import type {ReactNode} from 'react';

interface SidebarItemContentProps {
    label?: string;
    icon?: string | ReactNode;
    hasSubMenu?: boolean;
    isExpanded?: boolean;
    isCollapsed: boolean;
}

export function SidebarItemContent({label, icon, hasSubMenu, isExpanded, isCollapsed}: SidebarItemContentProps) {

    return (
        <div className={cn(
            "flex items-center w-full",
            isCollapsed ? "justify-center" : "justify-between"
        )}>
            <div className="flex items-center gap-3">
                {icon && typeof icon === 'string' ? (
                    <Icon
                        name={icon}
                        className={cn(
                            "shrink-0 transition-colors duration-200 w-5 h-5"
                        )}
                    />
                ) : icon ? (
                    <span className={cn(
                        "shrink-0 transition-colors duration-200 w-5 h-5 flex items-center justify-center"
                    )}>
                        {icon}
                    </span>
                ) : null}
                {!isCollapsed && <span className="whitespace-nowrap truncate">{label}</span>}
            </div>
            {!isCollapsed && hasSubMenu && (
                <span className="flex items-center text-(--c-text-muted) transition-transform shrink-0 ml-auto">
                    {isExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </span>
            )}
        </div>
    );
}
