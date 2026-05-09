import {storefrontSectionRegistry} from "@/configs/storefront/storefrontSectionRegistry.ts";

import type {StorefrontSectionConfig} from '@/types/storefront/storefrontTypes';


// import {storefrontSectionRegistry} from '@/storefront/sections/registry';

interface StorefrontComposerProps {
    sections: StorefrontSectionConfig[];
}

export const StorefrontComposer = ({sections}: StorefrontComposerProps) => {
    return (
        <div className="space-y-8">
            {sections
                .filter((section) => section.enabled !== false)
                .map((section) => {
                    const SectionComponent = storefrontSectionRegistry[section.type];
                    if (!SectionComponent) {
                        console.warn(`Unsupported storefront section type: ${section.type}`);
                        return null;
                    }

                    return <SectionComponent key={section.id} props={section.props}/>;
                })}
        </div>
    );
};

