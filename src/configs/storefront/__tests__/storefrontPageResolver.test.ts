import {describe, expect, it, vi} from 'vitest';
import {resolveStorefrontPageCore} from '@/configs/storefront/resolveStorefrontPageCore';
import {storefrontPageRegistry} from '@/configs/storefront/storefrontPageRegistry.ts';
import type {StorefrontPageComponent, StorefrontPageKey} from '@/types/storefront/storefrontPageContracts.ts';
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts';

const mockStorefrontConfig: StorefrontClientConfig = {
    id: 'default',
    displayName: 'Test Storefront',
    hostnames: ['localhost'],
    branding: {
        name: 'Test',
        tagline: 'Test'
    },
    navigation: {},
    theme: {
        background: '#fff',
        panel: '#fff',
        text: '#000',
        mutedText: '#999',
        accent: '#0066cc',
        accentText: '#fff',
        border: '#ddd',
    },
    home: {
        sections: []
    },
    footer: {},
};

const uvhVariantStorefrontConfig: StorefrontClientConfig = {
    ...mockStorefrontConfig,
    id: 'uvh',
    pages: {
        variants: {
            contactUs: 'uvh-contact-us',
            aboutUs: 'uvh-about-us',
        },
    },
}

describe('resolveStorefrontPageCore', () => {
    it('should resolve known page key to the default registry component', () => {
        const mockComponent = vi.fn() as unknown as StorefrontPageComponent;
        const result = resolveStorefrontPageCore({
            routeKey: 'products',
            routeComponent: mockComponent,
            storefrontConfig: mockStorefrontConfig,
        });

        expect(result.component).toBeDefined();
        expect(result.component).not.toBeNull();
        expect(result.pageKey).toBe('products');
        expect(result.resolvedVariant).toContain('default');
        expect(result.fallbackApplied).toBe(false);
    });

    it('should fall back to original route component for unknown page key', () => {
        const mockFallbackComponent = vi.fn() as unknown as StorefrontPageComponent;
        const result = resolveStorefrontPageCore({
            routeKey: 'nonexistent' as StorefrontPageKey,
            routeComponent: mockFallbackComponent,
            storefrontConfig: mockStorefrontConfig,
        });

        expect(result.component).toBe(mockFallbackComponent);
        expect(result.fallbackApplied).toBe(true);
        expect(result.fallbackReason).toBe('missing-registry-entry');
        expect(result.resolvedVariant).toBe('default');
    });

    it('should fall back to original route component when registry entry is missing', () => {
        const mockFallbackComponent = vi.fn() as unknown as StorefrontPageComponent;
        const pageKeyToTest: StorefrontPageKey = 'checkout';

        // Save original
        const originalEntry = storefrontPageRegistry[pageKeyToTest];

        // Temporarily remove entry
        delete (storefrontPageRegistry as any)[pageKeyToTest];

        try {
            const result = resolveStorefrontPageCore({
                routeKey: pageKeyToTest,
                routeComponent: mockFallbackComponent,
                storefrontConfig: mockStorefrontConfig,
            });

            expect(result.component).toBe(mockFallbackComponent);
            expect(result.fallbackApplied).toBe(true);
            expect(result.fallbackReason).toBe('missing-registry-entry');
            expect(result.resolvedVariant).toBe('default');
        } finally {
            // Restore original
            (storefrontPageRegistry as any)[pageKeyToTest] = originalEntry;
        }
    });

    it('should never return an undefined or null component', () => {
        const mockComponent = vi.fn() as unknown as StorefrontPageComponent;

        // Valid key
        const validResult = resolveStorefrontPageCore({
            routeKey: 'home',
            routeComponent: mockComponent,
            storefrontConfig: mockStorefrontConfig,
        });
        expect(validResult.component).toBeDefined();
        expect(validResult.component).not.toBeNull();

        // Invalid key
        const invalidResult = resolveStorefrontPageCore({
            routeKey: 'unknown' as StorefrontPageKey,
            routeComponent: mockComponent,
            storefrontConfig: mockStorefrontConfig,
        });
        expect(invalidResult.component).toBeDefined();
        expect(invalidResult.component).not.toBeNull();
    });

    it('resolves uvh contactUs variant token from normalized discovered key', () => {
        const fallbackComponent = vi.fn() as unknown as StorefrontPageComponent
        const result = resolveStorefrontPageCore({
            routeKey: 'contactUs',
            routeComponent: fallbackComponent,
            storefrontConfig: uvhVariantStorefrontConfig,
        })

        expect(result.resolvedVariant).toBe('uvh-contact-us')
        expect(result.fallbackApplied).toBe(false)
    })

    it('resolves uvh aboutUs variant token from normalized discovered key', () => {
        const fallbackComponent = vi.fn() as unknown as StorefrontPageComponent
        const result = resolveStorefrontPageCore({
            routeKey: 'aboutUs',
            routeComponent: fallbackComponent,
            storefrontConfig: uvhVariantStorefrontConfig,
        })

        expect(result.resolvedVariant).toBe('uvh-about-us')
        expect(result.fallbackApplied).toBe(false)
    })
});
