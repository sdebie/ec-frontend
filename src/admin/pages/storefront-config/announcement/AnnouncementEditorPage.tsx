import {Button} from '@/shared/ui/primitives'
import {PageLayout} from '@/shared/ui/components'
import {useAnnouncementForm} from './hooks/useAnnouncementForm'
import {useAnnouncementPreview} from './hooks/useAnnouncementPreview'
import {AnnouncementPreviewPanel} from './components/AnnouncementPreviewPanel'
import {AnnouncementContentPanel} from './components/AnnouncementContentPanel'
import {AnnouncementDisplayOptionsPanel} from './components/AnnouncementDisplayOptionsPanel'

export function AnnouncementEditorPage() {
    const {form, setForm, isLoading, isError, handleSave, isSaving} = useAnnouncementForm()
    const {hasAnythingToPreview, previewConfig} = useAnnouncementPreview(form)

    if (isLoading) {
        return <div className="p-8 text-sm text-(--c-text-muted)">Loading announcement settings…</div>
    }

    if (isError) {
        return <div className="p-8 text-sm text-(--c-status-red-text)">Failed to load settings. Please try again.</div>
    }

    const saveFooter = (
        <div className="flex justify-end">
            <Button type="button" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
                Save Changes
            </Button>
        </div>
    )

    return (
        <PageLayout
            title="Announcement Banner"
            subtitle="Configure the announcement banner displayed above the storefront header."
            stickyFooter={saveFooter}
        >
            <div className="flex flex-col gap-6">
                <AnnouncementPreviewPanel hasAnythingToPreview={hasAnythingToPreview} previewConfig={previewConfig}/>
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                    <AnnouncementContentPanel form={form} setForm={setForm}/>
                    <AnnouncementDisplayOptionsPanel form={form} setForm={setForm}/>
                </div>
            </div>
        </PageLayout>
    )
}
