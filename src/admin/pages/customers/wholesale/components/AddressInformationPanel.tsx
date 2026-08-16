import {MapPinHouse} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {WholesaleApplicationDetailHeader} from '../../components/WholesaleApplicationDetailHeader.tsx'

interface AddressInformationPanelProps {
    application: WholesaleApplicationDetail
}

export function AddressInformationPanel({application}: AddressInformationPanelProps) {
    return (
        <Card as="section" elevation="none" padded={false}>
            <WholesaleApplicationDetailHeader icon={MapPinHouse} title="Address Information"/>
            <Card.Body className="p-5">
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                            Physical Address
                        </p>
                        <div className="flex flex-col gap-1 text-sm text-(--c-text)">
                            {application.physicalAddressLine1 && <p>{application.physicalAddressLine1}</p>}
                            {application.physicalAddressLine2 && <p>{application.physicalAddressLine2}</p>}
                            {application.physicalSuburb && <p>{application.physicalSuburb}</p>}
                            {(application.physicalCity || application.physicalProvince) && (
                                <p>
                                    {[application.physicalCity, application.physicalProvince]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            )}
                            {application.physicalPostalCode && <p>{application.physicalPostalCode}</p>}
                            {!application.physicalAddressLine1 && (
                                <p className="text-(--c-text-muted)">No physical address provided</p>
                            )}
                        </div>
                    </div>
                    <div className="sm:border-l sm:border-(--c-border) sm:pl-6">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                            Postal Address
                        </p>
                        <div className="flex flex-col gap-1 text-sm text-(--c-text)">
                            {application.postalAddressLine1 && <p>{application.postalAddressLine1}</p>}
                            {application.postalAddressLine2 && <p>{application.postalAddressLine2}</p>}
                            {application.postalSuburb && <p>{application.postalSuburb}</p>}
                            {(application.postalCity || application.postalProvince) && (
                                <p>
                                    {[application.postalCity, application.postalProvince]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            )}
                            {application.postalPostalCode && <p>{application.postalPostalCode}</p>}
                            {!application.postalAddressLine1 && (
                                <p className="text-(--c-text-muted)">No postal address provided</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
