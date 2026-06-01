import {type ReactNode, useCallback, useRef, useState} from 'react';
import {Compass, FileText, LayoutGrid, Paintbrush, Palette, Settings, Store} from 'lucide-react';
import {Segment} from '@/components';
import {Button} from '@/primitives/button';
import {Card} from '@/primitives/card';
import {useStorefrontSettings} from '@/pages/admin/storefrontSettings/hooks/useStorefrontSettings';
import {BrandingTab} from '@/pages/admin/storefrontSettings/tabs/BrandingTab';
import {FooterTab} from '@/pages/admin/storefrontSettings/tabs/FooterTab';
import {GeneralTab} from '@/pages/admin/storefrontSettings/tabs/GeneralTab';
import {HomeSectionsTab} from '@/pages/admin/storefrontSettings/tabs/HomeSectionsTab';
import {NavigationTab} from '@/pages/admin/storefrontSettings/tabs/NavigationTab';
import {StoreTab} from '@/pages/admin/storefrontSettings/tabs/StoreTab';
import {ThemeTab} from '@/pages/admin/storefrontSettings/tabs/ThemeTab';

const TABS = [
    {value: 'store', label: 'Store', icon: <Store className="h-4 w-4"/>},
    {value: 'general', label: 'General', icon: <Settings className="h-4 w-4"/>},
    {value: 'branding', label: 'Branding', icon: <Palette className="h-4 w-4"/>},
    {value: 'theme', label: 'Theme', icon: <Paintbrush className="h-4 w-4"/>},
    {value: 'navigation', label: 'Navigation', icon: <Compass className="h-4 w-4"/>},
    {value: 'footer', label: 'Footer', icon: <FileText className="h-4 w-4"/>},
    {value: 'home', label: 'Home Sections', icon: <LayoutGrid className="h-4 w-4"/>},
] as const;

type TabValue = (typeof TABS)[number]['value'];

const StorefrontSettingsPage = () => {
    const [activeTab, setActiveTab] = useState<TabValue>('general');
    const {settings, error, saveSection} = useStorefrontSettings();

    const saveFnRef = useRef<() => void>(() => {
    });
    const registerSave = useCallback((fn: () => void) => {
        saveFnRef.current = fn;
    }, []);

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                Storefront Settings
            </h2>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <Card padded={false} className="overflow-hidden flex flex-col h-[580px]">
                <Segment
                    variant="tabs"
                    options={TABS as unknown as { value: string; label: string; icon: ReactNode }[]}
                    value={activeTab}
                    onChange={v => setActiveTab(v as TabValue)}
                />
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'store' && <StoreTab registerSave={registerSave}/>}
                    {activeTab === 'general' && (
                        <GeneralTab data={settings.config} onSave={saveSection} registerSave={registerSave}/>
                    )}
                    {activeTab === 'branding' && (
                        <BrandingTab data={settings.branding} onSave={saveSection} registerSave={registerSave}/>
                    )}
                    {activeTab === 'theme' && (
                        <ThemeTab data={settings.theme} onSave={saveSection} registerSave={registerSave}/>
                    )}
                    {activeTab === 'navigation' && (
                        <NavigationTab data={settings.navigation} onSave={saveSection} registerSave={registerSave}/>
                    )}
                    {activeTab === 'footer' && (
                        <FooterTab data={settings.footer} onSave={saveSection} registerSave={registerSave}/>
                    )}
                    {activeTab === 'home' && (
                        <HomeSectionsTab data={settings.homeSections} onSave={saveSection} registerSave={registerSave}/>
                    )}
                </div>
                <div className="flex justify-end px-6 py-4 border-t border-admin-border shrink-0">
                    <Button variant="solid" onClick={() => saveFnRef.current()}>
                        Save Changes
                    </Button>
                </div>
            </Card>
        </section>
    );
};

export default StorefrontSettingsPage;
