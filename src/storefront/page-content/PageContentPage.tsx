import {usePublicPageContent} from './hooks/usePublicPageContent'
import {NotFoundPage} from '@/storefront/pages/NotFoundPage'
import {PageContentDocument} from './components/PageContentDocument'
import {PageContentSkeleton} from './components/PageContentSkeleton'
import {PageContentErrorCard} from './components/PageContentErrorCard'

export function PageContentPage({slug}: { slug: string }) {
    const {data, isLoading, error, isNotFound, refetch} = usePublicPageContent(slug)

    if (isLoading) {
        return <PageContentSkeleton/>
    }

    if (isNotFound) {
        return <NotFoundPage/>
    }

    if (error) {
        return <PageContentErrorCard onRetry={() => refetch()}/>
    }

    if (!data) {
        return null
    }

    return <PageContentDocument data={data}/>
}
