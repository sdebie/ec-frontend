import {useEffect, useRef} from 'react';
import {Controller, useForm} from 'react-hook-form';

import {Form, FormItem, InputField, toast} from '@/components';
import {Button} from '@/primitives/button';
import {Card} from '@/primitives/card';
import {STOREFRONT_SETTING_KEYS, StorefrontThemeSection} from '@/types/admin/StorefrontSettingsTypes';

type ColorFieldProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    helperText?: string;
};

function ColorField({label, value, onChange, helperText}: ColorFieldProps) {
    return (
        <FormItem label={label} helperText={helperText}>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={e => onChange(e.target.value)}
                    className="h-9 w-12 shrink-0 cursor-pointer rounded border border-admin-border bg-admin-panel p-0.5"
                />
                <InputField
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="#000000"
                    className="font-mono"
                />
            </div>
        </FormItem>
    );
}

type Props = {
    data: StorefrontThemeSection;
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

export function ThemeTab({data, onSave, registerSave}: Props) {
    const {control, handleSubmit, reset, watch, formState: {isDirty, isSubmitting}} = useForm<StorefrontThemeSection>({
        defaultValues: data,
    });

    const saveFnRef = useRef<() => void>(() => {});
    saveFnRef.current = () => { void handleSubmit(onSubmit)(); };
    useEffect(() => { registerSave?.(() => saveFnRef.current()); }, [registerSave]);

    useEffect(() => {
        reset(data);
    }, [data, reset]);

    const watched = watch();

    const onSubmit = async (values: StorefrontThemeSection) => {
        const ok = await onSave(STOREFRONT_SETTING_KEYS.THEME, values);
        if (ok) {
            toast.success('Theme saved');
            reset(values);
        } else {
            toast.error('Failed to save theme');
        }
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
                {/* Live preview strip */}
                <Card>
                    <p className="text-xs font-medium text-admin-text-muted mb-3">Live Preview</p>
                    <div
                        className="rounded-lg overflow-hidden border"
                        style={{borderColor: watched.border}}
                    >
                        <div
                            className="px-4 py-3 flex items-center gap-4"
                            style={{background: watched.navBackground || watched.background, borderBottom: `1px solid ${watched.navBorder || watched.border}`}}
                        >
                            <div className="w-6 h-6 rounded" style={{background: watched.accent}}/>
                            <span className="text-sm font-medium" style={{color: watched.navText || watched.text}}>
                                Brand Name
                            </span>
                            <span className="ml-auto text-xs" style={{color: watched.navTextHover || watched.accent}}>
                                Products
                            </span>
                        </div>
                        <div className="px-4 py-6" style={{background: watched.background}}>
                            <p className="text-sm font-semibold" style={{color: watched.text}}>Page content</p>
                            <p className="text-xs mt-1" style={{color: watched.mutedText}}>Supporting text</p>
                            <div className="mt-3 inline-flex">
                                <button
                                    type="button"
                                    className="px-3 py-1.5 rounded text-xs font-medium"
                                    style={{background: watched.accent, color: watched.accentText}}
                                >
                                    Call to Action
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Base colours */}
                <Card>
                    <h3 className="text-sm font-semibold text-admin-text mb-4">Base Colours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(
                            [
                                {name: 'background', label: 'Background'},
                                {name: 'panel', label: 'Panel'},
                                {name: 'text', label: 'Text'},
                                {name: 'mutedText', label: 'Muted Text'},
                                {name: 'accent', label: 'Accent'},
                                {name: 'accentText', label: 'Accent Text'},
                                {name: 'border', label: 'Border'},
                            ] as const
                        ).map(({name, label}) => (
                            <Controller
                                key={name}
                                name={name}
                                control={control}
                                render={({field}) => (
                                    <ColorField
                                        label={label}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        ))}
                    </div>
                </Card>

                {/* Navigation colours */}
                <Card>
                    <h3 className="text-sm font-semibold text-admin-text mb-4">Navigation Colours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(
                            [
                                {name: 'navBackground', label: 'Nav Background'},
                                {name: 'navText', label: 'Nav Text'},
                                {name: 'navTextHover', label: 'Nav Text Hover'},
                                {name: 'navBorder', label: 'Nav Border'},
                                {name: 'navIconText', label: 'Nav Icon Text'},
                                {name: 'navIconTextHover', label: 'Nav Icon Text Hover'},
                            ] as const
                        ).map(({name, label}) => (
                            <Controller
                                key={name}
                                name={name}
                                control={control}
                                render={({field}) => (
                                    <ColorField
                                        label={label}
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        ))}
                    </div>
                </Card>

                {/* Status + surface colours */}
                <Card>
                    <h3 className="text-sm font-semibold text-admin-text mb-4">Status & Surface</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(
                            [
                                {name: 'error', label: 'Error'},
                                {name: 'success', label: 'Success'},
                                {name: 'surfaceMuted', label: 'Muted Surface'},
                                {name: 'ring', label: 'Focus Ring'},
                            ] as const
                        ).map(({name, label}) => (
                            <Controller
                                key={name}
                                name={name}
                                control={control}
                                render={({field}) => (
                                    <ColorField
                                        label={label}
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        ))}
                        <Controller
                            name="radius"
                            control={control}
                            render={({field}) => (
                                <FormItem label="Border Radius" helperText="e.g. 0.5rem or 8px">
                                    <InputField {...field} value={field.value ?? ''} placeholder="0.5rem"
                                                className="font-mono"/>
                                </FormItem>
                            )}
                        />
                    </div>
                </Card>

                {/* Shadows */}
                <Card>
                    <h3 className="text-sm font-semibold text-admin-text mb-4">Shadows</h3>
                    <div className="space-y-4">
                        <Controller
                            name="shadowSm"
                            control={control}
                            render={({field}) => (
                                <FormItem label="Shadow SM" helperText="CSS box-shadow value">
                                    <InputField {...field} value={field.value ?? ''}
                                                placeholder="0 1px 3px rgba(0,0,0,0.1)"
                                                className="font-mono"/>
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="shadowLg"
                            control={control}
                            render={({field}) => (
                                <FormItem label="Shadow LG">
                                    <InputField {...field} value={field.value ?? ''}
                                                placeholder="0 10px 40px rgba(0,0,0,0.15)"
                                                className="font-mono"/>
                                </FormItem>
                            )}
                        />
                    </div>
                </Card>
            </div>

        </Form>
    );
}
