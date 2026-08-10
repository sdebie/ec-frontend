/**
 * Feature: admin-product-write, Task 3.3
 * Integration test — ProductForm image lifecycle: no optimistic deletion,
 * abandoned-upload cleanup on cancel.
 *
 * Validates: Requirements 2.6, 3.7, 5.2
 *
 * These tests exercise that:
 * - Image removal in the form only changes local state (no file/association deletion)
 * - On cancel, every session upload is cleaned up because none has been saved
 * - On successful submit, session uploads tracker is cleared (server owns associations)
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ProductForm } from '../components/ProductForm'
import type { ProductFormValues } from '../components/ProductForm'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('ProductForm — image lifecycle (no optimistic deletion + cleanup)', () => {
  const categories = [{ id: 'cat-1', name: 'Test Category' }]
  let mockOnUpload: ReturnType<typeof vi.fn<(file: File) => Promise<string>>>
  let mockOnCleanup: ReturnType<typeof vi.fn<(filePath: string) => Promise<void>>>
  let mockOnSubmit: ReturnType<typeof vi.fn<(values: ProductFormValues) => void | Promise<void>>>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnUpload = vi.fn<(file: File) => Promise<string>>()
    mockOnCleanup = vi.fn<(filePath: string) => Promise<void>>().mockResolvedValue(undefined)
    mockOnSubmit = vi.fn<(values: ProductFormValues) => void | Promise<void>>()
  })

  function renderForm(defaultValues?: Partial<ProductFormValues>) {
    return render(
      <MemoryRouter>
        <ProductForm
          mode="create"
          categories={categories}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          onUpload={mockOnUpload}
          onCleanup={mockOnCleanup}
          defaultValues={defaultValues}
        />
      </MemoryRouter>,
    )
  }

  it('does NOT call onCleanup when an image is removed from the form (no optimistic deletion)', async () => {
    // Render with existing images (simulating an already-saved product)
    renderForm({
      name: 'Test Product',
      slug: 'test-product',
      categoryIds: ['cat-1'],
      images: [{ url: 'existing-saved-image.jpg', altText: '' }],
      variants: [{ sku: 'SKU-001', price: '10.00', stock: 5 }],
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: /images/i }))

    const removeButton = screen.getByRole('button', { name: /remove image/i })
    await user.click(removeButton)

    // onCleanup must NOT be called — removal only changes local form state
    expect(mockOnCleanup).not.toHaveBeenCalled()
  })

  it('cleans up abandoned session uploads on cancel', async () => {
    // Simulate: user uploads a file, then removes it from the form, then cancels.
    // The removed file was a session upload so it should be cleaned up.
    mockOnUpload.mockResolvedValueOnce('session-upload-1.jpg')

    renderForm({
      name: 'Cancel Test',
      slug: 'cancel-test',
      categoryIds: ['cat-1'],
      images: [],
      variants: [{ sku: 'SKU-002', price: '15.00', stock: 3 }],
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: /images/i }))

    // Upload a file via the hidden file input
    const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement
    const file = new File(['px'], 'photo.jpg', { type: 'image/jpeg' })
    await user.upload(fileInput, file)
    await waitFor(() => expect(mockOnUpload).toHaveBeenCalledWith(file))

    // Wait for the uploaded image to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument()
    })

    // Remove the image from the form (it's still tracked as a session upload)
    const removeButton = screen.getByRole('button', { name: /remove image/i })
    await user.click(removeButton)

    // Now cancel — the abandoned upload should be cleaned up
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Cleanup should be called for the abandoned upload (uploaded but removed from form)
    await waitFor(() => {
      expect(mockOnCleanup).toHaveBeenCalledWith('session-upload-1.jpg')
    })
  })

  it('cleans up session uploads that remain in form images on cancel', async () => {
    // A current form image is still unassociated until Save succeeds, so cancel
    // must clean it up as well.
    mockOnUpload.mockResolvedValueOnce('kept-in-form.jpg')

    renderForm({
      name: 'Keep Test',
      slug: 'keep-test',
      categoryIds: ['cat-1'],
      images: [],
      variants: [{ sku: 'SKU-003', price: '20.00', stock: 2 }],
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: /images/i }))

    const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement
    const file = new File(['px'], 'keep.jpg', { type: 'image/jpeg' })
    await user.upload(fileInput, file)
    await waitFor(() => expect(mockOnUpload).toHaveBeenCalled())

    // Wait for the image to appear in the form (it remains, not removed)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument()
    })

    // Cancel WITHOUT removing the image
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(mockOnCleanup).toHaveBeenCalledWith('kept-in-form.jpg')
    })
  })

  it('clears session uploads tracker on successful submit (server owns association)', async () => {
    // After submit, session uploads should be cleared — onCleanup not called
    mockOnUpload.mockResolvedValueOnce('submitted-img.jpg')

    renderForm({
      name: 'Submit Test',
      slug: 'submit-test',
      categoryIds: ['cat-1'],
      images: [],
      variants: [{ sku: 'SKU-004', price: '25.00', stock: 1 }],
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: /images/i }))

    const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement
    const file = new File(['px'], 'submit.jpg', { type: 'image/jpeg' })
    await user.upload(fileInput, file)
    await waitFor(() => expect(mockOnUpload).toHaveBeenCalled())

    // Wait for the image to be in the form
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument()
    })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create product/i })
    await user.click(submitButton)

    // On successful submit, onSubmit is called with form values including the uploaded image
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    // After submit, onCleanup should NOT have been called for the submitted image
    expect(mockOnCleanup).not.toHaveBeenCalledWith('submitted-img.jpg')
  })
})
