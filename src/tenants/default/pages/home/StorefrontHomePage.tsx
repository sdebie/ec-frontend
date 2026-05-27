import {StorefrontComposer} from './StorefrontComposer';

import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';

interface StorefrontHomePageProps {
    storefrontConfig: StorefrontClientConfig;
}

const StorefrontHomePage = ({storefrontConfig}: StorefrontHomePageProps) => {
    return <StorefrontComposer sections={storefrontConfig.home?.sections ?? []}/>;
};

export default StorefrontHomePage;

