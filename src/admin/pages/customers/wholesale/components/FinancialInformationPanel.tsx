import {HandCoins} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {InfoRow} from '../../components/InfoRow'
import {WholesaleApplicationDetailHeader} from '../../components/WholesaleApplicationDetailHeader.tsx'

interface FinancialInformationPanelProps {
    application: WholesaleApplicationDetail
}

export function FinancialInformationPanel({application}: FinancialInformationPanelProps) {
    return (
        <Card as="section" variant="bordered">
            <WholesaleApplicationDetailHeader icon={HandCoins} title="Financial Information"/>
            <Card.Body className="p-5">
                <InfoRow label="Contact Name" value={application.financeContactName || '—'}/>
                <InfoRow label="Contact Email" value={application.financeContactEmail || '—'}/>
                <InfoRow label="Contact Phone" value={application.financeContactPhone || '—'}/>
            </Card.Body>
        </Card>
    )
}
