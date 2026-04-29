import type {StorefrontCmsPageDefinition} from '@/types/storefront/storefrontTypes'

interface CmsPageProps {
    page: StorefrontCmsPageDefinition
}

export function CmsPage({page}: CmsPageProps) {
    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
            {page.blocks.map((block) => {
                if (block.type === 'hero') {
                    return (
                        <section key={block.id} className="rounded-xl border border-(--sf-border) bg-(--sf-panel) p-8">
                            <h1 className="text-3xl font-bold text-(--sf-text)">
                                {block.content.title ?? page.title}
                            </h1>
                            {block.content.subtitle && (
                                <p className="mt-2 text-(--sf-muted-text)">{block.content.subtitle}</p>
                            )}
                        </section>
                    )
                }

                if (block.type === 'rich-text') {
                    return (
                        <section key={block.id} className="mt-6 rounded-xl border border-(--sf-border) bg-(--sf-panel) p-6">
                            <p className="text-(--sf-text)">{block.content.body ?? ''}</p>
                        </section>
                    )
                }

                if (block.type === 'cta') {
                    return (
                        <section key={block.id} className="mt-6 rounded-xl border border-(--sf-border) bg-(--sf-panel) p-6">
                            <h2 className="text-xl font-semibold text-(--sf-text)">{block.content.title ?? ''}</h2>
                            <p className="mt-2 text-(--sf-muted-text)">{block.content.description ?? ''}</p>
                        </section>
                    )
                }

                return null
            })}
        </main>
    )
}
