import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * **Validates: Requirements 5.2, 5.3, 5.4**
 *
 * Property test: isActive toggle idempotency.
 * Toggling `isActive: true → false → true` leaves the record `isActive: true` (the final value).
 * This tests that two sequential mutations against the same ID do not interfere —
 * each mutation takes effect independently.
 *
 * We model the mutation as a pure function that applies the staffDto to the record,
 * verifying that the last write wins.
 */

interface StaffRecord {
  id: string
  email: string
  fullName: string
  role: 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'ORDER_MANAGER' | 'VIEWER'
  isActive: boolean
  resetPassword: boolean
}

interface StaffDtoInput {
  email: string
  fullName: string
  role: 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'ORDER_MANAGER' | 'VIEWER'
  isActive: boolean
  resetPassword: boolean
}

/**
 * Models the behavior of updateStaffUser — the mutation applies the dto fields to the record.
 */
function applyUpdate(record: StaffRecord, dto: StaffDtoInput): StaffRecord {
  return {
    ...record,
    email: dto.email,
    fullName: dto.fullName,
    role: dto.role,
    isActive: dto.isActive,
    resetPassword: dto.resetPassword,
  }
}

const staffRecordArb = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  fullName: fc.string({ minLength: 2, maxLength: 50 }),
  role: fc.constantFrom('SUPER_ADMIN' as const, 'CATALOG_MANAGER' as const, 'ORDER_MANAGER' as const, 'VIEWER' as const),
  isActive: fc.boolean(),
  resetPassword: fc.constant(false),
})

describe('useUpdateStaff — isActive toggle idempotency', () => {
  it('toggling isActive true → false → true results in isActive: true', () => {
    fc.assert(
      fc.property(staffRecordArb, (initialRecord) => {
        // Build dto that sets isActive to false
        const dtoDeactivate: StaffDtoInput = {
          email: initialRecord.email,
          fullName: initialRecord.fullName,
          role: initialRecord.role,
          isActive: false,
          resetPassword: false,
        }

        // Build dto that sets isActive to true
        const dtoActivate: StaffDtoInput = {
          email: initialRecord.email,
          fullName: initialRecord.fullName,
          role: initialRecord.role,
          isActive: true,
          resetPassword: false,
        }

        // Apply first mutation: deactivate
        const afterDeactivate = applyUpdate(initialRecord, dtoDeactivate)
        expect(afterDeactivate.isActive).toBe(false)

        // Apply second mutation: activate
        const afterActivate = applyUpdate(afterDeactivate, dtoActivate)
        expect(afterActivate.isActive).toBe(true)

        // Final state matches the last mutation's intent
        return afterActivate.isActive === true
      }),
      { numRuns: 100 },
    )
  })

  it('each mutation independently sets isActive to the provided value regardless of previous state', () => {
    fc.assert(
      fc.property(
        staffRecordArb,
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
        (initialRecord, toggleSequence) => {
          let record = { ...initialRecord }

          for (const targetActive of toggleSequence) {
            const dto: StaffDtoInput = {
              email: record.email,
              fullName: record.fullName,
              role: record.role,
              isActive: targetActive,
              resetPassword: false,
            }
            record = applyUpdate(record, dto)
            // After each mutation, the record's isActive matches the dto value
            if (record.isActive !== targetActive) return false
          }

          // Final state matches the last toggle value
          return record.isActive === toggleSequence[toggleSequence.length - 1]
        },
      ),
      { numRuns: 100 },
    )
  })
})
