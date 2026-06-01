import {Plus, Trash2} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

import {FormItem, InputField, Switcher, toast} from '@/components';
import {Button} from '@/primitives/button';
import {
    STOREFRONT_SETTING_KEYS,
    StorefrontNavLinkItem,
    StorefrontNavSection,
} from '@/types/admin/StorefrontSettingsTypes';

type Props = {
    data: StorefrontNavSection;
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

const emptyLink = (): StorefrontNavLinkItem => ({
    id: crypto.randomUUID(),
    label: '',
    path: '',
    external: false,
    sortOrder: 0,
});

export function NavigationTab({data, onSave, registerSave}: Props) {
    const [items, setItems] = useState<StorefrontNavLinkItem[]>(data.items);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setItems(data.items);
        setIsDirty(false);
    }, [data]);

    const update = (id: string, patch: Partial<StorefrontNavLinkItem>) => {
        setItems(prev => prev.map(item => item.id === id ? {...item, ...patch} : item));
        setIsDirty(true);
    };

    const addItem = () => {
        setItems(prev => [...prev, {...emptyLink(), sortOrder: prev.length}]);
        setIsDirty(true);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id).map((item, i) => ({...item, sortOrder: i})));
        setIsDirty(true);
    };

    const save = async () => {
        setIsSaving(true);
        const normalised = items.map((item, i) => ({...item, sortOrder: i}));
        const ok = await onSave(STOREFRONT_SETTING_KEYS.NAVIGATION, {items: normalised});
        if (ok) {
            setItems(normalised);
            setIsDirty(false);
            toast.success('Navigation saved');
        } else {
            toast.error('Failed to save navigation');
        }
        setIsSaving(false);
    };

    const saveFnRef = useRef<() => void>(() => {});
    saveFnRef.current = () => { void save(); };
    useEffect(() => { registerSave?.(() => saveFnRef.current()); }, [registerSave]);

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                    {items.length === 0 && (
                        <p className="text-sm text-admin-text-muted py-4 text-center">
                            No nav items yet. Add one below.
                        </p>
                    )}
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end p-3 rounded-lg border border-admin-border bg-admin-sidebar"
                        >
                            <FormItem label={index === 0 ? 'Label' : undefined}>
                                <InputField
                                    value={item.label}
                                    onChange={e => update(item.id, {label: e.target.value})}
                                    placeholder="e.g. About Us"
                                />
                            </FormItem>
                            <FormItem label={index === 0 ? 'Path' : undefined}>
                                <InputField
                                    value={item.path}
                                    onChange={e => update(item.id, {path: e.target.value})}
                                    placeholder="/about-us or https://..."
                                />
                            </FormItem>
                            <div className={index === 0 ? 'pt-5' : ''}>
                                <div className="flex items-center gap-2">
                                    <Switcher
                                        checked={!!item.external}
                                        onChange={val => update(item.id, {external: val})}
                                    />
                                    <span className="text-xs text-admin-text-muted whitespace-nowrap">External</span>
                                </div>
                            </div>
                            <div className={index === 0 ? 'pt-5' : ''}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="text-admin-text-muted hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="pt-4 border-t border-admin-border">
                <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1"/>
                    Add Link
                </Button>
            </div>
        </div>
    );
}
