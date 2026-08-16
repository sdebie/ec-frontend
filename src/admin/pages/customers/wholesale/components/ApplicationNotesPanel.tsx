import {Card} from '@/shared/ui/primitives'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {WholesaleApplicationDetailHeader} from '../../components/WholesaleApplicationDetailHeader.tsx'

interface ApplicationNotesPanelProps {
    application: WholesaleApplicationDetail
}

/** Renders nothing when the application has no notes. */
export function ApplicationNotesPanel({application}: ApplicationNotesPanelProps) {
    if (!application.notes) return null

    return (
        <Card as="section" elevation="none" padded={false}>
            <WholesaleApplicationDetailHeader title="Notes"/>
            <Card.Body className="p-5">
                <p className="text-sm text-(--c-text) whitespace-pre-wrap">
                    {application.notes}
                </p>
            </Card.Body>
        </Card>
    )
}
