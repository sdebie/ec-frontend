import {describe, expect, it} from 'vitest'
import {ORDER_ACTIONS} from '../orderActions'
import {CONFIRMED_ACTIONS} from '../confirmedActions'

describe('ORDER_ACTIONS / CONFIRMED_ACTIONS parity', () => {
  it.each(ORDER_ACTIONS)(
    'every non-ship prompt on $target resolves to a CONFIRMED_ACTIONS entry targeting the same status',
    (meta) => {
      if (meta.prompt === 'ship') return

      const action = CONFIRMED_ACTIONS[meta.prompt]
      // TypeScript's ConfirmedAction union already guarantees the key exists at compile time —
      // this catches the copy-paste mistake TS can't: the WRONG status wired to a real key.
      expect(action.status).toBe(meta.target)
    },
  )

  it('exactly one transition uses the special "ship" prompt (IN_TRANSIT)', () => {
    const shipTransitions = ORDER_ACTIONS.filter((m) => m.prompt === 'ship')
    expect(shipTransitions.map((m) => m.target)).toEqual(['IN_TRANSIT'])
  })

  it('every transition has a truthy prompt (no transition moves without confirming)', () => {
    for (const meta of ORDER_ACTIONS) {
      expect(meta.prompt).toBeTruthy()
    }
  })
})
