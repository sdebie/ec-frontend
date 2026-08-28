import {describe, expect, it} from 'vitest'
import {adminMenuRoutes} from '../adminMenuRoutes.config'
import {ICON_NAMES} from '@/shared/ui/icons/iconRegistry'

/**
 * A route names its icon with a string, and `Icon` renders nothing when the name is not
 * registered — the only complaint is a `console.warn` that production never emits. So a
 * typo, or an icon added to the config but not the registry, reaches users as a menu item
 * with a blank where its icon should be and nothing anywhere reports it.
 */

type MenuRoute = { meta?: { icon?: string }; subMenu?: MenuRoute[] }

const iconNamesIn = (routes: MenuRoute[]): string[] =>
    routes.flatMap((route) => [
        ...(route.meta?.icon ? [route.meta.icon] : []),
        ...iconNamesIn(route.subMenu ?? []),
    ])

describe('admin menu icons', () => {
    it('every icon a menu route names is registered in the Icon registry', () => {
        const named = [...new Set(iconNamesIn(adminMenuRoutes))]
        const missing = named.filter((name) => !ICON_NAMES.includes(name))

        expect(named.length).toBeGreaterThan(0)
        expect(missing).toEqual([])
    })
})
