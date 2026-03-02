import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
    name: string;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
    // Convert kebab-case or snake_case to PascalCase for Lucide icons
    // e.g., 'layout-dashboard' -> 'LayoutDashboard'
    const pascalName = name
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');

    const LucideIcon = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name];

    if (!LucideIcon) {
        console.warn(`Icon "${name}" (as "${pascalName}") not found in lucide-react`);
        return null;
    }

    return <LucideIcon {...props} />;
};

export default Icon;
