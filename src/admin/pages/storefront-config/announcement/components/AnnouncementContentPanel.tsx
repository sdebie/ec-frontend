import type {Dispatch, SetStateAction} from 'react'
import {Megaphone} from 'lucide-react'
import {Card, Input} from '@/shared/ui/primitives'
import type {AnnouncementFormValues} from '../hooks/useAnnouncementForm'
import {ToggleField} from './ToggleField'

export function AnnouncementContentPanel({
    form,
    setForm,
}: {
    form: AnnouncementFormValues
    setForm: Dispatch<SetStateAction<AnnouncementFormValues>>
}) {
    return (
        <Card as="section" variant="bordered" className="flex h-full flex-col">
            <Card.Header className="m-0 flex items-center gap-3 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                    <Megaphone className="h-4 w-4" aria-hidden="true"/>
                </span>
                <span>Content</span>
            </Card.Header>
            <Card.Body className="space-y-6 px-5 py-4">
                <ToggleField
                    checked={form.enabled}
                    onChange={(enabled) => setForm((prev) => ({...prev, enabled}))}
                    label="Enabled"
                    statusText={form.enabled ? 'Enabled' : 'Disabled'}
                />

                <div className="max-w-2xl space-y-1">
                    <label htmlFor="announcement-text" className="text-sm font-medium text-(--c-text)">
                        Announcement Text
                    </label>
                    <Input
                        id="announcement-text"
                        type="text"
                        value={form.text}
                        onChange={(e) => setForm((prev) => ({...prev, text: e.target.value}))}
                        placeholder="e.g. Free shipping on orders over R500!"
                    />
                </div>

                <div className="grid max-w-2xl grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="bg-color" className="text-sm font-medium text-(--c-text)">
                            Background Colour
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="bg-color"
                                type="color"
                                value={form.backgroundColor}
                                onChange={(e) => setForm((prev) => ({...prev, backgroundColor: e.target.value}))}
                                className="h-9 w-9 cursor-pointer rounded border border-(--c-border)"
                            />
                            <span className="text-sm text-(--c-text-muted)">{form.backgroundColor}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="text-color" className="text-sm font-medium text-(--c-text)">
                            Text Colour
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="text-color"
                                type="color"
                                value={form.textColor}
                                onChange={(e) => setForm((prev) => ({...prev, textColor: e.target.value}))}
                                className="h-9 w-9 cursor-pointer rounded border border-(--c-border)"
                            />
                            <span className="text-sm text-(--c-text-muted)">{form.textColor}</span>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
