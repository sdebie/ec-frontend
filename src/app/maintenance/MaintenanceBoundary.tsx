import type {ErrorInfo, ReactNode} from 'react'
import {Component} from 'react'

import {MaintenancePage} from './MaintenancePage'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

/**
 * Last-line-of-defense error boundary, mounted once in Appx around the
 * router. Anything that escapes the route- and section-level handling renders
 * the full-site MaintenancePage instead of a white screen.
 *
 * Deliberately offers no "try again" affordance: at this level the app state
 * is unknown, so the only honest recovery is a full reload, which the user
 * already has via the browser. Route-scoped recovery UX belongs to
 * RouteErrorBoundary, not here.
 */
export class MaintenanceBoundary extends Component<Props, State> {
    state: State = {hasError: false}

    static getDerivedStateFromError(): State {
        return {hasError: true}
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('[MaintenanceBoundary]', error, errorInfo.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return <MaintenancePage/>
        }

        return this.props.children
    }
}
