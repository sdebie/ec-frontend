import {HandCoins} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {InfoRow} from './InfoRow'
import {WholesaleApplicationDetailHeader} from './WholesaleApplicationDetailHeader.tsx'

interface FinancialInformationPanelProps {
    application: WholesaleApplicationDetail
}

export function FinancialInformationPanel({application}: FinancialInformationPanelProps) {
    return (
        <Card as="section" elevation="none" padded={false}>
            <WholesaleApplicationDetailHeader icon={HandCoins} title="Financial Information"/>
            <Card.Body className="p-5">
                <InfoRow label="Contact Name" value={application.financeContactName || '-'}/>
                <InfoRow label="Contact Email" value={application.financeContactEmail || '-'}/>
                <InfoRow label="Contact Phone" value={application.financeContactPhone || '-'}/>
            </Card.Body>
        </Card>
    )
}
