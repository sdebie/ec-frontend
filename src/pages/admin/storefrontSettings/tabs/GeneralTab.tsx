import {useEffect, useRef} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Form, FormItem, InputField, Switcher, toast} from '@/components';
import {STOREFRONT_SETTING_KEYS, StorefrontConfigSection} from '@/types/admin/StorefrontSettingsTypes';

type Props = {
    data: StorefrontConfigSection;
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

export function GeneralTab({data, onSave, registerSave}: Props) {
    const {control, handleSubmit, reset} = useForm<StorefrontConfigSection>({
        defaultValues: data,
    });

    useEffect(() => {
        reset(data);
    }, [data, reset]);

    const saveFnRef = useRef<() => void>(() => {
    });
    saveFnRef.current = () => {
        void handleSubmit(onSubmit)();
    };
    useEffect(() => {
        registerSave?.(() => saveFnRef.current());
    }, [registerSave]);

    const onSubmit = async (values: StorefrontConfigSection) => {
        const ok = await onSave(STOREFRONT_SETTING_KEYS.CONFIG, values);
        if (ok) {
            toast.success('General settings saved');
            reset(values);
        } else {
            toast.error('Failed to save general settings');
        }
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                    name="slug"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Slug">
                            <InputField
                                {...field}
                                placeholder="e.g. uvh"
                                readOnly
                                className="opacity-60 cursor-not-allowed"
                                helperText="Set once at deployment — cannot be changed here"
                            />
                        </FormItem>
                    )}
                />
                <Controller
                    name="displayName"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Display Name" required>
                            <InputField {...field} placeholder="e.g. UVH Holdings"/>
                        </FormItem>
                    )}
                />
                <Controller
                    name="locale"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Locale">
                            <InputField {...field} value={field.value ?? ''} placeholder="e.g. en-ZA"
                                        helperText="BCP-47 locale for number and date formatting"/>
                        </FormItem>
                    )}
                />
                <Controller
                    name="defaultCountryCode"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Default Country Code">
                            <InputField {...field} value={field.value ?? ''} placeholder="e.g. ZA"
                                        helperText="ISO 3166-1 alpha-2"/>
                        </FormItem>
                    )}
                />
                <Controller
                    name="productsLabel"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Products Nav Label">
                            <InputField {...field} value={field.value ?? ''} placeholder="e.g. Products"/>
                        </FormItem>
                    )}
                />
                <Controller
                    name="stickyHeader"
                    control={control}
                    render={({field}) => (
                        <FormItem label="Sticky Header">
                            <div className="flex items-center gap-3 pt-1">
                                <Switcher checked={!!field.value} onChange={field.onChange}/>
                                <span className="text-sm text-admin-text-muted">
                                        {field.value ? 'Enabled' : 'Disabled'}
                                    </span>
                            </div>
                        </FormItem>
                    )}
                />
            </div>
        </Form>
    );
}
