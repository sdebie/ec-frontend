import * as React from 'react'
import {ProductStatus, ProductStatusOptions} from '@/shared/types/enums'
import {StatusBadge} from '@/shared/ui/components/status-badge/StatusBadge'

export interface ProductStatusDisplayProps {
    status: ProductStatus | string
}

export const ProductStatusDisplay: React.FC<ProductStatusDisplayProps> = ({status}) => {
    const option = ProductStatusOptions[status as ProductStatus]
    return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'}/>
}
