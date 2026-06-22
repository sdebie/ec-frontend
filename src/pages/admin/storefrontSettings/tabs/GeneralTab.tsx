import {useEffect, useMemo, useRef, useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {Form, FormItem, InputField, Select, Switcher, toast} from '@/components';
import {fetchCountryInfoResponse, fetchCountryListResponse} from '@/services/rest/CountriesService.rest.ts';
import {STOREFRONT_SETTING_KEYS, StorefrontConfigSection} from '@/types/admin/StorefrontSettingsTypes';

type Props = {
    data: StorefrontConfigSection;
    onSave: (key: string, data: unknown) => Promise<boolean>;
    registerSave?: (fn: () => void) => void;
};

type RestCountryName = {
    common?: string;
    official?: string;
};

type RestCountry = {
    name?: RestCountryName;
    cca2?: string;
    capital?: string[];
    region?: string;
    subregion?: string;
};

type RestCountriesErrorPayload = {
    errors?: Array<{message?: string}>;
};

type CountryOption = {
    value: string;
    label: string;
    queryName: string;
};

const parseCountryPayload = (payload: unknown): RestCountry[] => {
    if (Array.isArray(payload)) {
        return payload as RestCountry[];
    }
    if (payload && typeof payload === 'object' && Array.isArray((payload as {data?: unknown[]}).data)) {
        return (payload as {data: RestCountry[]}).data;
    }
    return [];
};

const parseOptionalJson = async (response: Response): Promise<unknown | null> => {
    const raw = await response.text();
    if (!raw.trim()) {
        return null;
    }
    try {
        return JSON.parse(raw) as unknown;
    } catch {
        return null;
    }
};

const getRestCountriesErrorMessage = async (response: Response): Promise<string> => {
    const payload = await parseOptionalJson(response);
    if (payload && typeof payload === 'object') {
        const firstError = (payload as RestCountriesErrorPayload).errors?.[0]?.message?.trim();
        if (firstError) {
            return firstError;
        }
    }
    return `Request failed (${response.status})`;
};

export function GeneralTab({data, onSave, registerSave}: Props) {
    const {control, handleSubmit, reset} = useForm<StorefrontConfigSection>({
        defaultValues: data,
    });
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
    const [isCountryListLoading, setIsCountryListLoading] = useState(false);
    const [countryInfo, setCountryInfo] = useState<RestCountry | null>(null);
    const [isCountryInfoLoading, setIsCountryInfoLoading] = useState(false);
    const selectedCountryCode = useWatch({control, name: 'defaultCountryCode'});

    const countryOptionByCode = useMemo(
        () => new Map(countryOptions.map((option) => [option.value, option])),
        [countryOptions]
    );

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

    useEffect(() => {
        const abortController = new AbortController();

        const loadCountryList = async () => {
            setIsCountryListLoading(true);
            try {
                const response = await fetchCountryListResponse({signal: abortController.signal});
                if (!response.ok) {
                    const reason = await getRestCountriesErrorMessage(response);
                    throw new Error(`Failed to load countries: ${reason}`);
                }

                const payload = await parseOptionalJson(response);
                const options = parseCountryPayload(payload)
                    .map((country) => {
                        const code = country.cca2?.trim().toUpperCase();
                        const name = country.name?.common?.trim() || country.name?.official?.trim();
                        if (!code || !name) {
                            return null;
                        }
                        return {
                            value: code,
                            label: `${name} (${code})`,
                            queryName: name,
                        };
                    })
                    .filter((option): option is CountryOption => !!option)
                    .sort((a, b) => a.queryName.localeCompare(b.queryName));

                setCountryOptions(options);
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error('Failed to load country list', error);
                    toast.error('Failed to load country list');
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsCountryListLoading(false);
                }
            }
        };

        void loadCountryList();

        return () => abortController.abort();
    }, []);

    useEffect(() => {
        const selectedCode = selectedCountryCode?.trim().toUpperCase();
        if (!selectedCode) {
            setCountryInfo(null);
            return;
        }

        const selectedCountry = countryOptionByCode.get(selectedCode);
        if (!selectedCountry) {
            setCountryInfo(null);
            return;
        }

        const abortController = new AbortController();

        const loadCountryInfo = async () => {
            setIsCountryInfoLoading(true);
            try {
                const response = await fetchCountryInfoResponse(selectedCountry.queryName.slice(0, 4), {
                    signal: abortController.signal,
                });
                if (!response.ok) {
                    const reason = await getRestCountriesErrorMessage(response);
                    throw new Error(`Failed to load country info: ${reason}`);
                }

                const payload = await parseOptionalJson(response);
                const countries = parseCountryPayload(payload);
                const exact = countries.find((country) => country.cca2?.toUpperCase() === selectedCode);
                setCountryInfo(exact ?? countries[0] ?? null);
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error('Failed to load country info', error);
                    setCountryInfo(null);
                    toast.error('Failed to load selected country info');
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsCountryInfoLoading(false);
                }
            }
        };

        void loadCountryInfo();
        return () => abortController.abort();
    }, [countryOptionByCode, selectedCountryCode]);

    const countryHelperText = useMemo(() => {
        if (isCountryInfoLoading) {
            return 'Loading country info...';
        }
        if (!countryInfo) {
            return 'ISO 3166-1 alpha-2';
        }
        const name = countryInfo.name?.common || countryInfo.name?.official || selectedCountryCode || 'Country';
        const capital = countryInfo.capital?.[0] ? `, Capital: ${countryInfo.capital[0]}` : '';
        const region = countryInfo.region ? `, Region: ${countryInfo.region}` : '';
        const subregion = countryInfo.subregion ? ` (${countryInfo.subregion})` : '';
        return `${name}${capital}${region}${subregion}`;
    }, [countryInfo, isCountryInfoLoading, selectedCountryCode]);

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
                        <FormItem label="Default Country Code" helperText={countryHelperText}>
                            <Select
                                options={countryOptions}
                                value={(field.value ?? '').toUpperCase()}
                                onChange={field.onChange}
                                placeholder={isCountryListLoading ? 'Loading countries...' : 'Select country'}
                                disabled={isCountryListLoading || countryOptions.length === 0}
                            />
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
