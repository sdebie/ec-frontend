import {Section} from '@/storefront/sections/shared'

export function PageContentSkeleton() {
    return (
        <Section as="div">
            <div
                className="animate-pulse rounded-2xl border border-(--sf-border) bg-(--sf-panel) px-6 py-10 sm:px-10 sm:py-12"
                aria-busy="true"
            >
                <div className="h-3 w-32 rounded bg-(--sf-border)"/>
                <div className="mt-4 h-8 w-1/2 rounded bg-(--sf-border)"/>
                <div className="mt-3 h-1 w-12 rounded-full bg-(--sf-border)"/>
                <div className="mt-4 h-4 w-1/4 rounded bg-(--sf-border)"/>
                <div className="mt-10 space-y-3 border-t border-(--sf-border) pt-8">
                    <div className="h-4 w-full rounded bg-(--sf-border)"/>
                    <div className="h-4 w-5/6 rounded bg-(--sf-border)"/>
                    <div className="h-4 w-4/6 rounded bg-(--sf-border)"/>
                    <div className="h-4 w-full rounded bg-(--sf-border)"/>
                    <div className="h-4 w-3/4 rounded bg-(--sf-border)"/>
                </div>
            </div>
        </Section>
    )
}