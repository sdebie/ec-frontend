export function PageContentErrorCard({onRetry}: { onRetry: () => void }) {
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
