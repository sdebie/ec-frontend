import {Building2} from 'lucide-react'
import {StatusBadge} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {InfoRow} from '../../components/InfoRow'
import {WholesaleApplicationDetailHeader} from '../../components/WholesaleApplicationDetailHeader.tsx'

interface CompanyInformationPanelProps {
    application: WholesaleApplicationDetail
}

export function CompanyInformationPanel({application}: CompanyInformationPanelProps) {
    return (
        <Card as="section" elevation="none" padded={false}>
            <WholesaleApplicationDetailHeader icon={Building2} title="Company Information"/>
            <Card.Body className="p-5">
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <div>
                        <InfoRow label="Company Name" value={application.companyName}/>
                        <InfoRow label="Trading Name" value={application.tradingName || '—'}/>
                        <InfoRow label="Company Phone" value={application.companyPhone || '—'}/>
                        <InfoRow label="Company Email" value={application.companyEmail || '—'}/>
                    </div>
                    <div className="sm:border-l sm:border-(--c-border) sm:pl-6">
                        <InfoRow label="Registration Number" value={application.regNumber || '—'}/>
                        <InfoRow label="VAT Number" value={application.vatNumber || '—'}/>
                        <InfoRow
                            label="Purchase Order Required"
                            value={
                                <StatusBadge
                                    label={application.purchaseOrderRequired ? 'Yes' : 'No'}
                                    color={application.purchaseOrderRequired ? 'green' : 'gray'}
                                />
                            }
                        />
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
