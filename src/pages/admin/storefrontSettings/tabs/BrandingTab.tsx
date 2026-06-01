import {useEffect, useRef} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Form, FormItem, InputField, toast} from '@/components';
import {STOREFRONT_SETTING_KEYS, StorefrontBrandingSection} from '@/types/admin/StorefrontSettingsTypes';

type Props = {
    data: StorefrontBrandingSection;
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

export function BrandingTab({data, onSave, registerSave}: Props) {
    const {control, handleSubmit, reset} = useForm<StorefrontBrandingSection>({
        defaultValues: data,
    });

    const saveFnRef = useRef<() => void>(() => {
    });
    saveFnRef.current = () => {
        void handleSubmit(onSubmit)();
    };
    useEffect(() => {
        registerSave?.(() => saveFnRef.current());
    }, [registerSave]);

    useEffect(() => {
        reset(data);
    }, [data, reset]);

    const onSubmit = async (values: StorefrontBrandingSection) => {
        const ok = await onSave(STOREFRONT_SETTING_KEYS.BRANDING, values);
        if (ok) {
            toast.success('Branding saved');
            reset(values);
        } else {
            toast.error('Failed to save branding');
        }
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                    name="name"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Brand Name" required>
                            <InputField {...field} placeholder="e.g. UVH Holdings"/>
                        </FormItem>
                    )}
                />
                <Controller
                    name="tagline"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Tagline">
                            <InputField {...field} value={field.value ?? ''}
                                        placeholder="Short brand tagline"/>
                        </FormItem>
                    )}
                />
                <div className="md:col-span-2">
                    <Controller
                        name="logoSrc"
                        control={control}
                        render={({field}) => (
                            <FormItem label="Logo URL" helperText="URL or /img/ path to the logo image">
                                <InputField {...field} value={field.value ?? ''} placeholder="/img/logo.png"/>
                            </FormItem>
                        )}
                    />
                </div>
                <Controller
                    name="logoAlt"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Logo Alt Text">
                            <InputField {...field} value={field.value ?? ''} placeholder="Brand logo"/>
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="logoWidth"
                        control={control}
                        render={({field}) => (
                            <FormItem label="Logo Width (px)">
                                <InputField
                                    type="number"
                                    min={0}
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </FormItem>
                        )}
                    />
                    <Controller
                        name="logoHeight"
                        control={control}
                        render={({field}) => (
                            <FormItem label="Logo Height (px)">
                                <InputField
                                    type="number"
                                    min={0}
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </Form>
    );
}
