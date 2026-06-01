import {ChevronDown, ChevronUp} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

import {Switcher, Textarea, toast} from '@/components';
import {Button} from '@/primitives/button';
import {Card} from '@/primitives/card';
import {STOREFRONT_SETTING_KEYS, StorefrontHomeSectionItem} from '@/types/admin/StorefrontSettingsTypes';

type Props = {
    data: StorefrontHomeSectionItem[];
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero',
    'featured-products': 'Featured Products',
    benefits: 'Benefits',
    cta: 'Call to Action',
    'promo-grid': 'Promo Grid',
    'category-preview': 'Category Preview',
    testimonials: 'Testimonials',
    newsletter: 'Newsletter',
};

export function HomeSectionsTab({data, onSave, registerSave}: Props) {
    const [sections, setSections] = useState<StorefrontHomeSectionItem[]>(data);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setSections(data);
        setIsDirty(false);
    }, [data]);

    const toggleEnabled = (id: string, enabled: boolean) => {
        setSections(prev => prev.map(s => s.id === id ? {...s, enabled} : s));
        setIsDirty(true);
    };

    const updateProps = (id: string, json: string) => {
        try {
            const parsed = JSON.parse(json);
            setSections(prev => prev.map(s => s.id === id ? {...s, props: parsed} : s));
            setIsDirty(true);
        } catch {
            // keep invalid json in the textarea without crashing
        }
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const next = [...sections];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        setSections(next.map((s, i) => ({...s, sortOrder: i})));
        setIsDirty(true);
    };

    const moveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const next = [...sections];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        setSections(next.map((s, i) => ({...s, sortOrder: i})));
        setIsDirty(true);
    };

    const save = async () => {
        setIsSaving(true);
        const ok = await onSave(STOREFRONT_SETTING_KEYS.HOME_SECTIONS, sections);
        if (ok) {
            setIsDirty(false);
            toast.success('Home sections saved');
        } else {
            toast.error('Failed to save home sections');
        }
        setIsSaving(false);
    };

    const saveFnRef = useRef<() => void>(() => {});
    saveFnRef.current = () => { void save(); };
    useEffect(() => { registerSave?.(() => saveFnRef.current()); }, [registerSave]);

    if (sections.length === 0) {
        return (
            <Card>
                <p className="text-sm text-admin-text-muted py-8 text-center">
                    No home sections configured. Home sections are defined in the tenant's TypeScript config and seeded here on first deploy.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {sections.map((section, index) => (
                <Card key={section.id}>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="h-5 w-5 p-0 text-admin-text-muted"
                            >
                                <ChevronUp className="w-3 h-3"/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveDown(index)}
                                disabled={index === sections.length - 1}
                                className="h-5 w-5 p-0 text-admin-text-muted"
                            >
                                <ChevronDown className="w-3 h-3"/>
                            </Button>
                        </div>

                        <Switcher
                            checked={section.enabled}
                            onChange={val => toggleEnabled(section.id, val)}
                        />

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-admin-text">
                                {SECTION_LABELS[section.type] ?? section.type}
                            </p>
                            <p className="text-xs text-admin-text-muted font-mono">{section.type}</p>
                        </div>

                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${section.enabled ? 'bg-green-100 text-green-700' : 'bg-admin-sidebar text-admin-text-muted'}`}>
                            {section.enabled ? 'Active' : 'Hidden'}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                            className="text-admin-text-muted shrink-0"
                        >
                            {expanded === section.id ? (
                                <ChevronUp className="w-4 h-4"/>
                            ) : (
                                <ChevronDown className="w-4 h-4"/>
                            )}
                        </Button>
                    </div>

                    {expanded === section.id && (
                        <div className="mt-4 pt-4 border-t border-admin-border">
                            <Textarea
                                label="Props (JSON)"
                                defaultValue={JSON.stringify(section.props, null, 2)}
                                onChange={e => updateProps(section.id, e.target.value)}
                                rows={8}
                                className="font-mono text-xs"
                                helperText="Edit section props as JSON. Changes apply on Save."
                            />
                        </div>
                    )}
                </Card>
            ))}

        </div>
    );
}
