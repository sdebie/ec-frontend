import type {ReactNode} from 'react'
import type {AdminCapability} from '@/shared/auth/adminPermissions'
import {useCan} from '@/shared/auth/adminPermissions'

export interface AuthorityCheckProps {
    capability: AdminCapability
    fallback?: ReactNode
    children: ReactNode
}

export function AuthorityCheck({capability, fallback = null, children}: AuthorityCheckProps) {
    const allowed = useCan(capability)
    return allowed ? <>{children}</> : <>{fallback}</>
}
