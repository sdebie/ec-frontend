import {useState} from 'react'
import {useController, useFormState, type Control, type UseFieldArrayReturn} from 'react-hook-form'
import {Check, ChevronLeft, ChevronRight, Pencil, Trash2} from 'lucide-react'
import {Button, Input} from '@/shared/ui/primitives'
import {cn} from '@/shared/utils/cn'
import {formatAmount} from '@/shared/utils/formatAmount'
// Operate on the parent product form's values — don't duplicate the shape.
import type {ProductFormValues} from './ProductForm'

interface VariantFieldsProps {
    control: Control<ProductFormValues>
    fields: UseFieldArrayReturn<ProductFormValues, 'variants'>['fields']
    append: UseFieldArrayReturn<ProductFormValues, 'variants'>['append']
    remove: UseFieldArrayReturn<ProductFormValues, 'variants'>['remove']
}

const ICON_BUTTON_CLASS = 'rounded-md p-1.5 text-(--c-text-muted) transition-colors hover:bg-(--c-surface-hover) hover:text-(--c-text) disabled:pointer-events-none disabled:opacity-40'

interface VariantRowProps {
    control: Control<ProductFormValues>
    index: number
    onRemove: () => void
    disableRemove: boolean
}

function VariantRow({control, index, onRemove, disableRemove}: VariantRowProps) {
    const skuController = useController({control, name: `variants.${index}.sku`})
    const priceController = useController({control, name: `variants.${index}.price`})
    const wholesalePriceController = useController({control, name: `variants.${index}.wholesalePrice`})
    const stockController = useController({control, name: `variants.${index}.stock`})

    // A row added in this session has a blank SKU at MOUNT and opens editable;
    // a row hydrated from the server starts read-only. The initializer runs
    // once, so typing never collapses the row.
    const [isEditingToggled, setIsEditingToggled] = useState(() => !skuController.field.value)

    const hasError = !!(
        skuController.fieldState.error ||
        priceController.fieldState.error ||
        wholesalePriceController.fieldState.error ||
        stockController.fieldState.error
    )
    // A row carrying validation errors cannot be collapsed — its messages
    // must stay visible until fixed.
    const isEditing = isEditingToggled || hasError

    const cellError = (message: string | undefined) =>
        message && <p role="alert" className="mt-1 text-xs text-(--c-error)">{message}</p>

    return (
        <tr
            data-testid={`variant-row-${index}`}
            className="border-b border-(--c-border) last:border-b-0"
        >
            <td className="px-3 py-2.5 align-top">
                {isEditing ? (
                    <>
                        <Input
                            {...skuController.field}
                            placeholder="e.g. PROD-001"
                            aria-label="SKU"
                            variant={skuController.fieldState.error ? 'error' : 'default'}
                        />
                        {cellError(skuController.fieldState.error?.message)}
                    </>
                ) : (
                    <span className="text-sm font-medium text-(--c-text)">{skuController.field.value}</span>
                )}
            </td>
            <td className="px-3 py-2.5 align-top">
                {isEditing ? (
                    <>
                        <Input
                            {...priceController.field}
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 99.99"
                            aria-label="Price"
                            variant={priceController.fieldState.error ? 'error' : 'default'}
                        />
                        {cellError(priceController.fieldState.error?.message)}
                    </>
                ) : (
                    <span className="text-sm text-(--c-text)">
                        {formatAmount(parseFloat(priceController.field.value))}
                    </span>
                )}
            </td>
            <td className="px-3 py-2.5 align-top">
                {isEditing ? (
                    <>
                        <Input
                            {...wholesalePriceController.field}
                            value={wholesalePriceController.field.value ?? ''}
                            type="text"
                            inputMode="decimal"
                            placeholder="Optional"
                            aria-label="Wholesale price"
                            variant={wholesalePriceController.fieldState.error ? 'error' : 'default'}
                        />
                        {cellError(wholesalePriceController.fieldState.error?.message)}
                    </>
                ) : (
                    <span className="text-sm text-(--c-text)">
                        {wholesalePriceController.field.value
                            ? formatAmount(parseFloat(wholesalePriceController.field.value))
                            : '—'}
                    </span>
                )}
            </td>
            <td className="px-3 py-2.5 align-top">
                {isEditing ? (
                    <>
                        <Input
                            {...stockController.field}
                            type="number"
                            step="1"
                            placeholder="0"
                            aria-label="Stock"
                            variant={stockController.fieldState.error ? 'error' : 'default'}
                            onChange={(e) => stockController.field.onChange(e.target.valueAsNumber)}
                        />
                        {cellError(stockController.fieldState.error?.message)}
                    </>
                ) : (
                    <span className="text-sm text-(--c-text)">{stockController.field.value}</span>
                )}
            </td>
            <td className="w-24 px-3 py-2.5 align-top">
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={() => setIsEditingToggled(!isEditing)}
                        data-testid={`edit-variant-${index}`}
                        aria-label={isEditing ? 'Finish editing variant' : 'Edit variant'}
                        title={isEditing ? 'Finish editing' : 'Edit'}
                        // Collapsing is blocked while the row has errors, and the
                        // check icon communicates "done" rather than "edit".
                        disabled={isEditing && hasError}
                        className={cn(ICON_BUTTON_CLASS, isEditing && 'text-(--c-accent)')}
                    >
                        {isEditing ? <Check className="h-4 w-4" aria-hidden="true"/> : <Pencil className="h-4 w-4" aria-hidden="true"/>}
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={disableRemove}
                        data-testid={`remove-variant-${index}`}
                        aria-label="Remove variant"
                        title="Remove"
                        className={cn(ICON_BUTTON_CLASS, 'hover:text-(--c-danger)')}
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true"/>
                    </button>
                </div>
            </td>
        </tr>
    )
}

const VARIANTS_PAGE_SIZE = 10

export function VariantFields({control, fields, append, remove}: VariantFieldsProps) {
    const [pageIndex, setPageIndex] = useState(0)
    const {errors} = useFormState({control})

    const pageCount = Math.max(1, Math.ceil(fields.length / VARIANTS_PAGE_SIZE))
    // Removing rows can shrink the page count below the stored index.
    const currentPage = Math.min(pageIndex, pageCount - 1)

    // A validation error on another page must pull that page into view, or the
    // message hides behind the pager. State-adjustment during render (not an
    // effect) — it runs once per newly-reported error index.
    const variantErrors = errors.variants
    const firstErrorIndex = Array.isArray(variantErrors)
        ? variantErrors.findIndex((rowError) => rowError != null)
        : -1
    const [lastHandledErrorIndex, setLastHandledErrorIndex] = useState(-1)
    if (firstErrorIndex !== lastHandledErrorIndex) {
        setLastHandledErrorIndex(firstErrorIndex)
        if (firstErrorIndex >= 0) {
            setPageIndex(Math.floor(firstErrorIndex / VARIANTS_PAGE_SIZE))
        }
    }

    const pageStart = currentPage * VARIANTS_PAGE_SIZE
    const pageFields = fields.slice(pageStart, pageStart + VARIANTS_PAGE_SIZE)

    const handleAppend = () => {
        append({sku: '', price: '', wholesalePrice: '', stock: 0})
        // The new row lands at the end — show the page it lands on.
        setPageIndex(Math.floor(fields.length / VARIANTS_PAGE_SIZE))
    }

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs text-(--c-text-muted)">
                    {fields.length} {fields.length === 1 ? 'variant' : 'variants'}
                </span>
                <Button
                    type="button"
                    variant="solid"
                    size="sm"
                    onClick={handleAppend}
                    data-testid="add-variant"
                >
                    Add Variant
                </Button>
            </div>

            <div className="overflow-x-auto rounded-(--c-radius) border border-(--c-border)">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-(--c-border) bg-(--c-surface-hover)">
                            <th scope="col" className="px-3 py-2 text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">SKU</th>
                            <th scope="col" className="px-3 py-2 text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">Retail Price</th>
                            <th scope="col" className="px-3 py-2 text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">Wholesale Price</th>
                            <th scope="col" className="px-3 py-2 text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">Stock</th>
                            <th scope="col" className="px-3 py-2 text-right text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageFields.map((field, pageOffset) => {
                            // Controllers and testids address the GLOBAL field
                            // index, not the position within the page.
                            const index = pageStart + pageOffset
                            return (
                                <VariantRow
                                    key={field.id}
                                    control={control}
                                    index={index}
                                    onRemove={() => remove(index)}
                                    disableRemove={fields.length <= 1}
                                />
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {pageCount > 1 && (
                <div className="mt-3 flex items-center justify-end gap-3">
                    <span className="text-xs text-(--c-text-muted)">
                        Page {currentPage + 1} of {pageCount}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 0}
                            onClick={() => setPageIndex(currentPage - 1)}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true"/>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= pageCount - 1}
                            onClick={() => setPageIndex(currentPage + 1)}
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true"/>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
