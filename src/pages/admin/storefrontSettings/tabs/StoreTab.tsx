import {useEffect, useRef, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, InputField, Select, Switcher, toast} from '@/components';
import {Button} from '@/primitives/button';
import {apiGetStoreSettings, apiSaveStoreSettings} from '@/services/graphql/admin/settings/SettingsService.graphql.ts';
import type {StoreSetting} from '@/types/admin/SettingsTypes.ts';
import {cn} from '@/utils/cn.ts';
import {parseVatRate} from '@/utils/vat.ts';
import VatCalculator from '../../settings/components/VatCalculator';

type PaymentMethodConfig = {
    displayName: string;
    description: string;
    enabled: boolean;
};

type PaymentMethodsAllowed = Record<string, PaymentMethodConfig>;

export function StoreTab({registerSave}: { registerSave?: (fn: () => void) => void } = {}) {
    const [storeSettings, setStoreSettings] = useState<StoreSetting[]>([]);

    const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
    const [newMethodName, setNewMethodName] = useState('');
    const [newMethodDescription, setNewMethodDescription] = useState('');
    const [newMethodEnabled, setNewMethodEnabled] = useState(true);
    const [newlyAddedKeys, setNewlyAddedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiGetStoreSettings();
                setStoreSettings(data.filter(s => !s.key.startsWith('storefront.')));
            } catch (error) {
                console.error('Failed to fetch store settings:', error);
                toast.error('Failed to load settings');
            }
        };

        fetchSettings();
    }, []);

    const handleInputChange = (key: string, value: string) => {
        setStoreSettings(prev => prev.map(s => s.key === key ? {...s, value} : s));
    };

    const handlePaymentMethodToggle = (settingKey: string, methodKey: string, enabled: boolean) => {
        const setting = storeSettings.find(s => s.key === settingKey);
        if (!setting) return;
        try {
            const paymentMethods = JSON.parse(setting.value) as PaymentMethodsAllowed;
            paymentMethods[methodKey].enabled = enabled;
            handleInputChange(settingKey, JSON.stringify(paymentMethods));
        } catch (e) {
            console.error('Failed to update payment method', e);
        }
    };

    const handleSave = async () => {
        try {
            const updated = await apiSaveStoreSettings(storeSettings);
            setStoreSettings(updated.filter(s => !s.key.startsWith('storefront.')));
            setNewlyAddedKeys(new Set());
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        }
    };

    const saveFnRef = useRef<() => void>(() => {
    });
    saveFnRef.current = () => {
        void handleSave();
    };
    useEffect(() => {
        registerSave?.(() => saveFnRef.current());
    }, [registerSave]);

    const handleAddPaymentMethod = () => {
        if (!newMethodName.trim()) {
            toast.error('Display name is required');
            return;
        }

        const settingKey = 'payment_methods_allowed';
        const setting = storeSettings.find(s => s.key === settingKey);
        if (!setting) return;

        try {
            const paymentMethods = JSON.parse(setting.value) as PaymentMethodsAllowed;
            const methodKey = newMethodName.toLowerCase().replace(/\s+/g, '_');

            if (paymentMethods[methodKey]) {
                toast.error('Payment method with this name already exists');
                return;
            }

            paymentMethods[methodKey] = {
                displayName: newMethodName,
                description: newMethodDescription,
                enabled: newMethodEnabled,
            };

            handleInputChange(settingKey, JSON.stringify(paymentMethods));
            setNewlyAddedKeys(prev => new Set(prev).add(methodKey));
            setNewMethodName('');
            setNewMethodDescription('');
            setNewMethodEnabled(true);
            setIsAddPaymentMethodOpen(false);
            toast.success('Payment method added locally');
        } catch (e) {
            console.error('Failed to add payment method', e);
            toast.error('Failed to add payment method');
        }
    };

    const booleanOptions = [
        {value: 'true', label: 'True'},
        {value: 'false', label: 'False'},
    ];

    const renderStoreSetting = (setting: StoreSetting) => {
        const commonProps = {
            key: setting.key,
            label: setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            helperText: setting.description,
        };

        switch (setting.key) {
            case 'payment_methods_allowed':
                try {
                    const paymentMethods = JSON.parse(setting.value) as PaymentMethodsAllowed;
                    return (
                        <div key={setting.key} className="col-span-2 space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-admin-text-muted">Payment Methods</h3>
                                <Button variant="outline" size="sm" onClick={() => setIsAddPaymentMethodOpen(true)}>
                                    Add Payment Method
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(paymentMethods).map(([key, config]) => (
                                    <div
                                        key={key}
                                        className={cn(
                                            'p-4 border rounded-lg bg-admin-sidebar flex items-center justify-between transition-colors',
                                            newlyAddedKeys.has(key)
                                                ? 'border-blue-500 ring-1 ring-blue-500/20'
                                                : 'border-admin-border',
                                        )}
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-admin-text">{config.displayName}</p>
                                            <p className="text-xs text-admin-text-muted">{config.description}</p>
                                        </div>
                                        <Switcher
                                            checked={config.enabled}
                                            onChange={(val) => handlePaymentMethodToggle(setting.key, key, val)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                } catch (e) {
                    console.warn('Failed to parse payment_methods_allowed JSON', e);
                    return (
                        <div key={setting.key} className="space-y-1">
                            <InputField
                                label={commonProps.label}
                                helperText={commonProps.helperText}
                                value={setting.value}
                                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                            />
                        </div>
                    );
                }
            case 'site_maintenance_enabled':
            case 'allow_guest_checkout':
            case 'create_account_post_checkout':
                return (
                    <Select
                        {...commonProps}
                        options={booleanOptions}
                        value={setting.value.toLowerCase()}
                        onChange={(newValue) => handleInputChange(setting.key, newValue)}
                    />
                );
            case 'vat_rate_percent': {
                const vatRatePercent = parseVatRate(setting.value);
                return (
                    <div key={setting.key} className="col-span-2 space-y-3">
                        <InputField
                            {...commonProps}
                            type="number"
                            min="0"
                            step="0.01"
                            value={setting.value}
                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                        />
                        <VatCalculator vatRatePercent={vatRatePercent}/>
                    </div>
                );
            }
            default:
                return (
                    <div key={setting.key} className="space-y-1">
                        <InputField
                            label={commonProps.label}
                            helperText={commonProps.helperText}
                            value={setting.value}
                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storeSettings.map(renderStoreSetting)}
            </div>
            <Dialog open={isAddPaymentMethodOpen} onClose={() => setIsAddPaymentMethodOpen(false)} size="md">
                <DialogHeader
                    title="Add Payment Method"
                    description="Configure a new payment method for your store."
                />
                <DialogContent className="space-y-4">
                    <div className="space-y-1">
                        <InputField
                            label="Display Name"
                            placeholder="e.g. Credit Card, PayPal"
                            value={newMethodName}
                            onChange={(e) => setNewMethodName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <InputField
                            label="Description"
                            placeholder="e.g. Pay securely with your credit card"
                            value={newMethodDescription}
                            onChange={(e) => setNewMethodDescription(e.target.value)}
                        />
                    </div>
                    <div
                        className="flex items-center justify-between p-3 border border-admin-border rounded-lg bg-admin-sidebar">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-admin-text">Enabled</p>
                            <p className="text-xs text-admin-text-muted">Make this payment method available at
                                checkout</p>
                        </div>
                        <Switcher checked={newMethodEnabled} onChange={setNewMethodEnabled}/>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)}>Cancel</Button>
                    <Button variant="solid" onClick={handleAddPaymentMethod}>Add Method</Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
