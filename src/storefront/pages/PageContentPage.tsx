import DOMPurify from 'dompurify'
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

function LoadingSkeleton() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 animate-pulse" aria-busy="true">
            <div className="h-8 w-2/3 rounded bg-(--sf-border)"/>
            <div className="mt-3 h-4 w-1/4 rounded bg-(--sf-border)"/>
            <div className="mt-8 space-y-3">
                <div className="h-4 w-full rounded bg-(--sf-border)"/>
                <div className="h-4 w-5/6 rounded bg-(--sf-border)"/>
                <div className="h-4 w-4/6 rounded bg-(--sf-border)"/>
                <div className="h-4 w-full rounded bg-(--sf-border)"/>
                <div className="h-4 w-3/4 rounded bg-(--sf-border)"/>
            </div>
        </div>
    )
}

function ErrorCard({onRetry}: { onRetry: () => void }) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="rounded-lg border border-(--sf-border) bg-(--sf-surface) p-6 text-center">
                <p className="text-sm text-(--sf-muted-text)">
                    Something went wrong loading this page.
                </p>
                <button
                    onClick={onRetry}
                    className="mt-4 rounded bg-(--sf-primary) px-4 py-2 text-sm text-(--sf-primary-text) hover:opacity-90"
                >
                    Try again
                </button>
            </div>
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

    return (
        <main className="mx-auto max-w-6xl px-4 py-12">
            <h1 className="text-2xl font-bold text-(--sf-text)">{data.title}</h1>
            <p className="mt-2 text-sm text-(--sf-muted-text)">
                Last updated: {formatDate(data.publishedAt)}
            </p>
            <div
                className="page-content-prose max-w-none text-(--sf-text) mt-4"
                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(data.content)}}
            />
        </main>
    )
}
