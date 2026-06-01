import {Plus, Trash2} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

import {InputField, Switcher, Textarea, toast} from '@/components';
import {Button} from '@/primitives/button';
import {Card} from '@/primitives/card';
import {
    STOREFRONT_SETTING_KEYS,
    StorefrontFooterColumn,
    StorefrontFooterLinkItem,
    StorefrontFooterSection,
    StorefrontLegalLinkItem,
    StorefrontSocialLinkItem,
} from '@/types/admin/StorefrontSettingsTypes';

type Props = {
    data: StorefrontFooterSection;
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

const newLink = (): StorefrontFooterLinkItem => ({
    id: crypto.randomUUID(), label: '', path: '', external: false, sortOrder: 0,
});

const newColumn = (): StorefrontFooterColumn => ({
    id: crypto.randomUUID(), heading: '', links: [],
});

const newSocial = (): StorefrontSocialLinkItem => ({
    id: crypto.randomUUID(), label: '', path: '', icon: '',
});

const newLegal = (): StorefrontLegalLinkItem => ({
    id: crypto.randomUUID(), label: '', path: '',
});

export function FooterTab({data, onSave, registerSave}: Props) {
    const [footer, setFooter] = useState<StorefrontFooterSection>(data);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setFooter(data);
        setIsDirty(false);
    }, [data]);

    const patch = (partial: Partial<StorefrontFooterSection>) => {
        setFooter(prev => ({...prev, ...partial}));
        setIsDirty(true);
    };

    // Column helpers
    const addColumn = () => patch({columns: [...footer.columns, newColumn()]});
    const removeColumn = (id: string) => patch({columns: footer.columns.filter(c => c.id !== id)});
    const updateColumn = (id: string, heading: string) =>
        patch({columns: footer.columns.map(c => c.id === id ? {...c, heading} : c)});
    const addColumnLink = (colId: string) =>
        patch({
            columns: footer.columns.map(c =>
                c.id === colId ? {...c, links: [...c.links, newLink()]} : c
            ),
        });
    const removeColumnLink = (colId: string, linkId: string) =>
        patch({
            columns: footer.columns.map(c =>
                c.id === colId ? {...c, links: c.links.filter(l => l.id !== linkId)} : c
            ),
        });
    const updateColumnLink = (colId: string, linkId: string, patch2: Partial<StorefrontFooterLinkItem>) =>
        patch({
            columns: footer.columns.map(c =>
                c.id === colId
                    ? {
                        ...c, links: c.links.map(l =>
                            l.id === linkId ? {...l, ...patch2} : l
                        ),
                    }
                    : c
            ),
        });

    // Social helpers
    const addSocial = () => patch({socialLinks: [...footer.socialLinks, newSocial()]});
    const removeSocial = (id: string) => patch({socialLinks: footer.socialLinks.filter(s => s.id !== id)});
    const updateSocial = (id: string, p: Partial<StorefrontSocialLinkItem>) =>
        patch({socialLinks: footer.socialLinks.map(s => s.id === id ? {...s, ...p} : s)});

    // Legal helpers
    const addLegal = () => patch({legalLinks: [...footer.legalLinks, newLegal()]});
    const removeLegal = (id: string) => patch({legalLinks: footer.legalLinks.filter(l => l.id !== id)});
    const updateLegal = (id: string, p: Partial<StorefrontLegalLinkItem>) =>
        patch({legalLinks: footer.legalLinks.map(l => l.id === id ? {...l, ...p} : l)});

    const save = async () => {
        setIsSaving(true);
        const ok = await onSave(STOREFRONT_SETTING_KEYS.FOOTER, footer);
        if (ok) {
            setIsDirty(false);
            toast.success('Footer saved');
        } else {
            toast.error('Failed to save footer');
        }
        setIsSaving(false);
    };

    const saveFnRef = useRef<() => void>(() => {});
    saveFnRef.current = () => { void save(); };
    useEffect(() => { registerSave?.(() => saveFnRef.current()); }, [registerSave]);

    return (
        <div className="space-y-6">
            {/* Prose */}
            <Card>
                <h3 className="text-sm font-semibold text-admin-text mb-4">Footer Text</h3>
                <div className="space-y-4">
                    <Textarea
                        label="Description"
                        value={footer.description ?? ''}
                        onChange={e => patch({description: e.target.value})}
                        rows={3}
                        placeholder="Short footer description"
                    />
                    <InputField
                        label="Callout Heading"
                        value={footer.calloutHeading ?? ''}
                        onChange={e => patch({calloutHeading: e.target.value})}
                        placeholder="e.g. Bulk orders & tenders"
                    />
                    <Textarea
                        label="Callout Body"
                        value={footer.calloutBody ?? ''}
                        onChange={e => patch({calloutBody: e.target.value})}
                        rows={2}
                        placeholder="Supporting text for the callout card"
                    />
                </div>
            </Card>

            {/* Link columns */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-admin-text">Link Columns</h3>
                    <Button variant="outline" size="sm" onClick={addColumn}>
                        <Plus className="w-4 h-4 mr-1"/> Add Column
                    </Button>
                </div>
                <div className="space-y-6">
                    {footer.columns.map(col => (
                        <div key={col.id} className="border border-admin-border rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <InputField
                                    value={col.heading}
                                    onChange={e => updateColumn(col.id, e.target.value)}
                                    placeholder="Column heading"
                                    className="flex-1"
                                />
                                <Button variant="ghost" size="sm" onClick={() => removeColumn(col.id)}
                                        className="text-admin-text-muted hover:text-red-500 shrink-0">
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="space-y-2 pl-2">
                                {col.links.map(link => (
                                    <div key={link.id}
                                         className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                                        <InputField
                                            value={link.label}
                                            onChange={e => updateColumnLink(col.id, link.id, {label: e.target.value})}
                                            placeholder="Label"
                                        />
                                        <InputField
                                            value={link.path}
                                            onChange={e => updateColumnLink(col.id, link.id, {path: e.target.value})}
                                            placeholder="/path or https://..."
                                        />
                                        <div className="flex items-center gap-1">
                                            <Switcher
                                                checked={!!link.external}
                                                onChange={val => updateColumnLink(col.id, link.id, {external: val})}
                                            />
                                            <span className="text-xs text-admin-text-muted">Ext</span>
                                        </div>
                                        <Button variant="ghost" size="sm"
                                                onClick={() => removeColumnLink(col.id, link.id)}
                                                className="text-admin-text-muted hover:text-red-500">
                                            <Trash2 className="w-3 h-3"/>
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => addColumnLink(col.id)}
                                        className="text-admin-text-muted">
                                    <Plus className="w-3 h-3 mr-1"/> Add link
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Social links */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-admin-text">Social Links</h3>
                    <Button variant="outline" size="sm" onClick={addSocial}>
                        <Plus className="w-4 h-4 mr-1"/> Add
                    </Button>
                </div>
                <div className="space-y-2">
                    {footer.socialLinks.map(s => (
                        <div key={s.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                            <InputField value={s.label} onChange={e => updateSocial(s.id, {label: e.target.value})}
                                        placeholder="Label"/>
                            <InputField value={s.path} onChange={e => updateSocial(s.id, {path: e.target.value})}
                                        placeholder="https://..."/>
                            <InputField value={s.icon} onChange={e => updateSocial(s.id, {icon: e.target.value})}
                                        placeholder="instagram"/>
                            <Button variant="ghost" size="sm" onClick={() => removeSocial(s.id)}
                                    className="text-admin-text-muted hover:text-red-500">
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Legal links */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-admin-text">Legal Links</h3>
                    <Button variant="outline" size="sm" onClick={addLegal}>
                        <Plus className="w-4 h-4 mr-1"/> Add
                    </Button>
                </div>
                <div className="space-y-2">
                    {footer.legalLinks.map(l => (
                        <div key={l.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                            <InputField value={l.label} onChange={e => updateLegal(l.id, {label: e.target.value})}
                                        placeholder="Label"/>
                            <InputField value={l.path} onChange={e => updateLegal(l.id, {path: e.target.value})}
                                        placeholder="/privacy-policy"/>
                            <Button variant="ghost" size="sm" onClick={() => removeLegal(l.id)}
                                    className="text-admin-text-muted hover:text-red-500">
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

        </div>
    );
}
