import {useMemo} from 'react'
import DOMPurify from 'dompurify'
import {ShieldCheck} from 'lucide-react'
import type {PublicPageContent} from '@/storefront/hooks/usePublicPageContent'
import {usePublicPageContent} from '@/storefront/hooks/usePublicPageContent'
import {NotFoundPage} from '@/storefront/pages/NotFoundPage'

function formatDate(iso: string): string {
    const date = new Date(iso)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

interface DocumentSection {
    number: string
    heading: string
    bodyHtml: string
}

interface ParsedDocument {
    introHtml: string
    sections: DocumentSection[]
}

// Splits already-sanitized page HTML on top-level <h2> boundaries. Content
// before the first <h2> becomes the header intro; each <h2> starts a section.
// A heading's own leading number ("3. Payments") moves into the section badge
// so the document keeps its authored numbering; unnumbered headings fall back
// to their position.
function parseDocument(sanitizedHtml: string): ParsedDocument {
    const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html')
    const intro = doc.createElement('div')
    const rawSections: { heading: string; container: HTMLElement }[] = []
    let current: HTMLElement | null = null

    for (const node of Array.from(doc.body.childNodes)) {
        if (node.nodeName === 'H2') {
            current = doc.createElement('div')
            rawSections.push({heading: node.textContent?.trim() ?? '', container: current})
        } else {
            ;(current ?? intro).appendChild(node.cloneNode(true))
        }
    }

    const sections = rawSections.map(({heading, container}, index) => {
        const numbered = /^(\d+)[.)]\s*(.+)$/.exec(heading)
        return {
            number: (numbered ? numbered[1] : String(index + 1)).padStart(2, '0'),
            heading: numbered ? numbered[2] : heading,
            bodyHtml: container.innerHTML,
        }
    })

    return {introHtml: intro.innerHTML, sections}
}

function LoadingSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 animate-pulse" aria-busy="true">
            <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) px-6 py-10 sm:px-10 sm:py-12">
                <div className="h-12 w-12 rounded-full bg-(--sf-border)"/>
                <div className="mt-5 h-3 w-32 rounded bg-(--sf-border)"/>
                <div className="mt-3 h-8 w-2/3 rounded bg-(--sf-border)"/>
                <div className="mt-3 h-4 w-1/4 rounded bg-(--sf-border)"/>
                <div className="mt-10 space-y-3 border-t border-(--sf-border) pt-8">
                    <div className="h-4 w-full rounded bg-(--sf-border)"/>
                    <div className="h-4 w-5/6 rounded bg-(--sf-border)"/>
                    <div className="h-4 w-4/6 rounded bg-(--sf-border)"/>
                    <div className="h-4 w-full rounded bg-(--sf-border)"/>
                    <div className="h-4 w-3/4 rounded bg-(--sf-border)"/>
                </div>
            </div>
        </div>
    )
}

function ErrorCard({onRetry}: { onRetry: () => void }) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 text-center">
                <p className="text-sm text-(--sf-muted-text)">
                    Something went wrong loading this page.
                </p>
                <button
                    onClick={onRetry}
                    className="mt-4 rounded bg-(--sf-accent) px-4 py-2 text-sm text-(--sf-accent-text) hover:opacity-90"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}

function PageContentDocument({data}: { data: PublicPageContent }) {
    const {introHtml, sections} = useMemo(
        () => parseDocument(DOMPurify.sanitize(data.content)),
        [data.content],
    )

    return (
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
            <article
                className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) px-6 py-10 shadow-(--sf-shadow-sm) sm:px-10 sm:py-12 lg:px-14">
                <header>
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sf-accent)_10%,var(--sf-panel))]"
                        aria-hidden="true"
                    >
                        <ShieldCheck className="h-6 w-6 text-(--sf-accent)"/>
                    </div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-(--sf-accent)">
                        Legal &amp; Privacy
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-(--sf-text) sm:text-4xl">
                        {data.title}
                    </h1>
                    <p className="mt-3 text-sm text-(--sf-muted-text)">
                        Last updated: {formatDate(data.publishedAt)}
                    </p>
                    {sections.length > 0 && introHtml && (
                        <div
                            className="page-content-prose mt-6 max-w-3xl text-(--sf-muted-text)"
                            dangerouslySetInnerHTML={{__html: introHtml}}
                        />
                    )}
                </header>

                {sections.length > 0 ? (
                    <div className="mt-10 divide-y divide-(--sf-border) border-t border-(--sf-border)">
                        {sections.map((section) => (
                            <section
                                key={section.number + section.heading}
                                className="grid grid-cols-[2.75rem_1fr] gap-x-4 py-8 sm:gap-x-6"
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sf-accent)_10%,var(--sf-panel))] text-sm font-semibold text-(--sf-accent)"
                                    aria-hidden="true"
                                >
                                    {section.number}
                                </div>
                                <h2 className="self-center text-lg font-semibold text-(--sf-text)">
                                    {section.heading}
                                </h2>
                                {section.bodyHtml && (
                                    <div
                                        className="page-content-prose col-span-2 mt-4 max-w-3xl text-(--sf-text) sm:col-span-1 sm:col-start-2"
                                        dangerouslySetInnerHTML={{__html: section.bodyHtml}}
                                    />
                                )}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div
                        className="page-content-prose mt-10 max-w-3xl border-t border-(--sf-border) pt-8 text-(--sf-text)"
                        dangerouslySetInnerHTML={{__html: introHtml}}
                    />
                )}
            </article>
        </div>
    )
}

export function PageContentPage({slug}: { slug: string }) {
    const {data, isLoading, error, isNotFound, refetch} = usePublicPageContent(slug)

    if (isLoading) {
        return <LoadingSkeleton/>
    }

    if (isNotFound) {
        return <NotFoundPage/>
    }

    if (error) {
        return <ErrorCard onRetry={() => refetch()}/>
    }

    if (!data) {
        return null
    }

    return <PageContentDocument data={data}/>
}
