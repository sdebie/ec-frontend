import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore, toast } from '../toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  describe('add', () => {
    it('adds a toast and returns its id', () => {
      const id = useToastStore.getState().add({
        variant: 'success',
        message: 'Item saved',
        duration: 4000,
      })

      expect(id).toBeTypeOf('string')
      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0]).toMatchObject({
        variant: 'success',
        message: 'Item saved',
        duration: 4000,
      })
    })

    it('supports optional title field', () => {
      useToastStore.getState().add({
        variant: 'info',
        message: 'Update available',
        title: 'Notice',
        duration: 4500,
      })

      expect(useToastStore.getState().toasts[0].title).toBe('Notice')
    })

    it('returns null and skips duplicate with same variant and message', () => {
      useToastStore.getState().add({
        variant: 'error',
        message: 'Network error',
        duration: 0,
      })

      const result = useToastStore.getState().add({
        variant: 'error',
        message: 'Network error',
        duration: 0,
      })

      expect(result).toBeNull()
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it('allows same message with different variant (not a duplicate)', () => {
      useToastStore.getState().add({
        variant: 'success',
        message: 'Done',
        duration: 4000,
      })

      const id = useToastStore.getState().add({
        variant: 'info',
        message: 'Done',
        duration: 4500,
      })

      expect(id).toBeTypeOf('string')
      expect(useToastStore.getState().toasts).toHaveLength(2)
    })

    it('enforces max 5 toasts by evicting oldest', () => {
      for (let i = 0; i < 6; i++) {
        useToastStore.getState().add({
          variant: 'info',
          message: `Message ${i}`,
          duration: 4500,
        })
      }

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(5)
      // Oldest (Message 0) should be evicted, newest (Message 5) present
      expect(toasts[0].message).toBe('Message 1')
      expect(toasts[4].message).toBe('Message 5')
    })

    it('keeps most recent 4 when at max and adds new one', () => {
      // Fill to 5
      for (let i = 0; i < 5; i++) {
        useToastStore.getState().add({
          variant: 'warning',
          message: `Toast ${i}`,
          duration: 6000,
        })
      }

      // Add one more
      useToastStore.getState().add({
        variant: 'success',
        message: 'New toast',
        duration: 4000,
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(5)
      // Toast 0 was evicted
      expect(toasts.map((t) => t.message)).toEqual([
        'Toast 1',
        'Toast 2',
        'Toast 3',
        'Toast 4',
        'New toast',
      ])
    })
  })

  describe('remove', () => {
    it('removes a toast by id', () => {
      const id = useToastStore.getState().add({
        variant: 'success',
        message: 'Saved',
        duration: 4000,
      })!

      useToastStore.getState().remove(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does nothing if id does not exist', () => {
      useToastStore.getState().add({
        variant: 'info',
        message: 'Hello',
        duration: 4500,
      })

      useToastStore.getState().remove('nonexistent-id')
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('imperative toast API', () => {
    it('toast.success adds with default duration 4000', () => {
      toast.success('Saved successfully')

      const item = useToastStore.getState().toasts[0]
      expect(item.variant).toBe('success')
      expect(item.message).toBe('Saved successfully')
      expect(item.duration).toBe(4000)
    })

    it('toast.error adds with duration 0 (persistent)', () => {
      toast.error('Something went wrong')

      const item = useToastStore.getState().toasts[0]
      expect(item.variant).toBe('error')
      expect(item.duration).toBe(0)
    })

    it('toast.warning adds with default duration 6000', () => {
      toast.warning('Check your input')

      const item = useToastStore.getState().toasts[0]
      expect(item.variant).toBe('warning')
      expect(item.duration).toBe(6000)
    })

    it('toast.info adds with default duration 4500', () => {
      toast.info('New update available')

      const item = useToastStore.getState().toasts[0]
      expect(item.variant).toBe('info')
      expect(item.duration).toBe(4500)
    })

    it('respects custom duration in options', () => {
      toast.success('Custom duration', { duration: 10000 })

      expect(useToastStore.getState().toasts[0].duration).toBe(10000)
    })

    it('respects title in options', () => {
      toast.info('Body message', { title: 'Heads up' })

      expect(useToastStore.getState().toasts[0].title).toBe('Heads up')
    })

    it('allows persistent override for non-error variants', () => {
      toast.success('Stay visible', { duration: 0 })

      expect(useToastStore.getState().toasts[0].duration).toBe(0)
    })
  })
})
