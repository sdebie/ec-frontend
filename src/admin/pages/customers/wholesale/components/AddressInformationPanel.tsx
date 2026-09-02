import {MapPinHouse} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {WholesaleApplicationDetailHeader} from '../../components/WholesaleApplicationDetailHeader.tsx'

interface AddressInformationPanelProps {
    application: WholesaleApplicationDetail
}

export function AddressInformationPanel({application}: AddressInformationPanelProps) {
    const physical = application.physicalAddress
    const postal = application.postalAddress

    return (
        <Card as="section" variant="bordered">
            <WholesaleApplicationDetailHeader icon={MapPinHouse} title="Address Information"/>
            <Card.Body className="p-5">
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                            Physical Address
                        </p>
                        <div className="flex flex-col gap-1 text-sm text-(--c-text)">
                            {physical?.line1 && <p>{physical.line1}</p>}
                            {physical?.line2 && <p>{physical.line2}</p>}
                            {physical?.suburb && <p>{physical.suburb}</p>}
                            {(physical?.city || physical?.province) && (
                                <p>
                                    {[physical?.city, physical?.province]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            )}
                            {physical?.postalCode && <p>{physical.postalCode}</p>}
                            {!physical?.line1 && (
                                <p className="text-(--c-text-muted)">No physical address provided</p>
                            )}
                        </div>
                    </div>
                    <div className="sm:border-l sm:border-(--c-border) sm:pl-6">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                            Postal Address
                        </p>
                        <div className="flex flex-col gap-1 text-sm text-(--c-text)">
                            {postal?.line1 && <p>{postal.line1}</p>}
                            {postal?.line2 && <p>{postal.line2}</p>}
                            {postal?.suburb && <p>{postal.suburb}</p>}
                            {(postal?.city || postal?.province) && (
                                <p>
                                    {[postal?.city, postal?.province]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            )}
                            {postal?.postalCode && <p>{postal.postalCode}</p>}
                            {!postal?.line1 && (
                                <p className="text-(--c-text-muted)">No postal address provided</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
