import type {Dispatch, SetStateAction} from 'react'
import {SlidersHorizontal} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import type {AnnouncementFormValues} from '../hooks/useAnnouncementForm'
import {ToggleField} from './ToggleField'

export function AnnouncementDisplayOptionsPanel({
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
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true"/>
                </span>
                <span>Display Options</span>
            </Card.Header>
            <Card.Body className="max-w-2xl space-y-4 px-5 py-4">
                <ToggleField
                    checked={form.showContact}
                    onChange={(showContact) => setForm((prev) => ({...prev, showContact}))}
                    label="Show Contact Info"
                    helpText="Shows phone, WhatsApp and email from Contact settings on the left of the bar. Tablet width and up only, and hidden automatically if none are configured there."
                />
                <ToggleField
                    checked={form.showSocial}
                    onChange={(showSocial) => setForm((prev) => ({...prev, showSocial}))}
                    label="Show Social Icons"
                    helpText="Shows the storefront's social links on the right of the bar. Tablet width and up only, and hidden automatically if none are configured."
                />
            </Card.Body>
        </Card>
    )
}
