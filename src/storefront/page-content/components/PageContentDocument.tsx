import type {PublicPageContent} from '../hooks/usePublicPageContent'
import {useMemo} from 'react'
import {parseDocument} from '../utils/parseDocument'
import DOMPurify from 'dompurify'
import {Section, SectionHeading} from '@/storefront/sections/shared'
import {formatDisplayDate} from '@/shared/utils/formatDateTime'

export function PageContentDocument({data}: { data: PublicPageContent }) {
    const {introHtml, sections} = useMemo(
        () => parseDocument(DOMPurify.sanitize(data.content)),
        [data.content],
    )

    return (
        <Section as="div">
            <article
                className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) px-6 py-10 shadow-(--sf-shadow-sm) sm:px-10 sm:py-12 lg:px-14">
                <header>
                    <SectionHeading
                        as="h1"
                        eyebrow="Important Information"
                        title={data.title}
                        subtitle={`Last updated: ${formatDisplayDate(data.publishedAt)}`}
                        className="mb-0"
                    />
                    {sections.length > 0 && introHtml && (
                        <div
                            className="page-content-prose mt-4 max-w-5xl text-(--sf-muted-text)"
                            dangerouslySetInnerHTML={{__html: introHtml}}
                        />
                    )}
                </header>

                {sections.length > 0 ? (
                    <div className="mt-8 divide-y divide-(--sf-border) border-t border-(--sf-border)">
                        {sections.map((section) => (
                            <section
                                key={section.number + section.heading}
                                className="grid grid-cols-[2.75rem_1fr] gap-x-4 py-6 sm:gap-x-6"
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
                                        className="page-content-prose col-span-2 mt-3 max-w-5xl text-(--sf-text) sm:col-span-1 sm:col-start-2"
                                        dangerouslySetInnerHTML={{__html: section.bodyHtml}}
                                    />
                                )}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div
                        className="page-content-prose mt-8 max-w-5xl border-t border-(--sf-border) pt-6 text-(--sf-text)"
                        dangerouslySetInnerHTML={{__html: introHtml}}
                    />
                )}
            </article>
        </Section>
    )
}
