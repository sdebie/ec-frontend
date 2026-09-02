import {useState} from 'react'
import {useController, useFieldArray, useFormState, useWatch, type Control, type UseFieldArrayReturn} from 'react-hook-form'
import {Check, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X} from 'lucide-react'
import {Button, Input} from '@/shared/ui/primitives'
import {FormItem, RowActionButton} from '@/shared/ui/components'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {VariantAttribute} from '../types'
// Operate on the parent product form's values — don't duplicate the shape.
import type {ProductFormValues} from './ProductForm'

interface VariantFieldsProps {
    control: Control<ProductFormValues>
    fields: UseFieldArrayReturn<ProductFormValues, 'variants'>['fields']
    append: UseFieldArrayReturn<ProductFormValues, 'variants'>['append']
    remove: UseFieldArrayReturn<ProductFormValues, 'variants'>['remove']
}

// Suggested attribute names offered as one-click chips — the two the editor is
// built around. Anything else (e.g. a legacy "Quantity" attribute) is still
// fully supported via "+ Custom attribute", since the wire format underneath
// (`attributesJson`) is a free-form JSON object, not a fixed pair of columns.
const QUICK_ADD_ATTRIBUTE_KEYS = ['Colour', 'Size']

function formatAttributesSummary(attributes: VariantAttribute[]): string {
    return attributes
        .filter((attribute) => attribute.key && attribute.value)
        .map((attribute) => `${attribute.key}: ${attribute.value}`)
        .join(' · ')
}

// Stock can transiently hold NaN while a number input is cleared mid-edit
// (`valueAsNumber` on an empty input) — never format that straight to text.
function formatStock(value: number): string {
    return Number.isFinite(value) ? String(value) : '—'
}

interface VariantCardProps {
    control: Control<ProductFormValues>
    index: number
    hasError: boolean
    onRemove: () => void
    disableRemove: boolean
}

function VariantCard({control, index, hasError, onRemove, disableRemove}: VariantCardProps) {
    const skuController = useController({control, name: `variants.${index}.sku`})
    const priceController = useController({control, name: `variants.${index}.price`})
    const wholesalePriceController = useController({control, name: `variants.${index}.wholesalePrice`})
    const stockController = useController({control, name: `variants.${index}.stock`})

    const {fields: attributeFields, append: appendAttribute, remove: removeAttribute} = useFieldArray({
        control,
        name: `variants.${index}.attributes`,
    })
    // Live values (not just field identities) are needed to render the collapsed
    // summary and to hide a quick-add chip once that attribute already exists.
    const liveAttributes = useWatch({control, name: `variants.${index}.attributes`}) ?? []

    // A row added in this session has a blank SKU at MOUNT and opens editable;
    // a row hydrated from the server starts read-only. The initializer runs
    // once, so typing never collapses the row.
    const [isEditingToggled, setIsEditingToggled] = useState(() => !skuController.field.value)

    // A row carrying validation errors — on any field, including a nested
    // attribute — cannot be collapsed — its messages must stay visible until fixed.
    const isEditing = isEditingToggled || hasError

    const cellError = (message: string | undefined) =>
        message && <p role="alert" className="mt-1 text-xs text-(--c-error)">{message}</p>

    // Only the array-root error (the combined-length guard) is read here — a
    // per-item error (duplicate/blank name or value) is rendered inline by the
    // AttributeRow it belongs to instead.
    const attributesRootError = useFormState({control, name: `variants.${index}.attributes`}).errors
        .variants?.[index]?.attributes as {message?: string} | undefined

    const hasAttributeKey = (key: string) =>
        liveAttributes.some((attribute) => attribute?.key?.trim().toLowerCase() === key.toLowerCase())

    const summary = formatAttributesSummary(liveAttributes)

    return (
        <div
            data-testid={`variant-row-${index}`}
            className="rounded-(--c-radius) border border-(--c-border) bg-(--c-panel)"
        >
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
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
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-sm font-medium text-(--c-text)">{skuController.field.value}</span>
                            {summary && <span className="text-xs text-(--c-text-muted)">{summary}</span>}
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <div className="hidden shrink-0 items-center gap-4 sm:flex">
                        <span className="text-sm text-(--c-text)">
                            {formatAmount(parseFloat(priceController.field.value))}
                        </span>
                        <span
                            data-testid={`variant-${index}-wholesale-display`}
                            className="text-sm text-(--c-text-muted)"
                        >
                            {wholesalePriceController.field.value
                                ? formatAmount(parseFloat(wholesalePriceController.field.value))
                                : '—'}
                        </span>
                        <span className="text-xs text-(--c-text-muted)">
                            {formatStock(stockController.field.value)} in stock
                        </span>
                    </div>
                )}
                <div className="flex shrink-0 items-center gap-1">
                    <RowActionButton
                        onClick={() => setIsEditingToggled(!isEditing)}
                        data-testid={`edit-variant-${index}`}
                        aria-label={isEditing ? 'Finish editing variant' : 'Edit variant'}
                        title={isEditing ? 'Finish editing' : 'Edit'}
                        // Collapsing is blocked while the row has errors, and the
                        // check icon communicates "done" rather than "edit".
                        disabled={isEditing && hasError}
                        className={isEditing ? 'text-(--c-accent)' : undefined}
                    >
                        {isEditing ? <Check className="h-4 w-4" aria-hidden="true"/> : <Pencil className="h-4 w-4" aria-hidden="true"/>}
                    </RowActionButton>
                    <RowActionButton
                        variant="danger"
                        onClick={onRemove}
                        disabled={disableRemove}
                        data-testid={`remove-variant-${index}`}
                        aria-label="Remove variant"
                        title="Remove"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true"/>
                    </RowActionButton>
                </div>
            </div>

            {isEditing && (
                <div className="space-y-5 border-t border-(--c-border) px-4 py-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <FormItem label="Retail Price" invalid={!!priceController.fieldState.error}>
                            <Input
                                {...priceController.field}
                                type="text"
                                inputMode="decimal"
                                placeholder="e.g. 99.99"
                                aria-label="Retail Price"
                                variant={priceController.fieldState.error ? 'error' : 'default'}
                            />
                        </FormItem>
                        <FormItem label="Wholesale Price" invalid={!!wholesalePriceController.fieldState.error} helperText="Optional">
                            <Input
                                {...wholesalePriceController.field}
                                value={wholesalePriceController.field.value ?? ''}
                                type="text"
                                inputMode="decimal"
                                placeholder="Optional"
                                aria-label="Wholesale Price"
                                variant={wholesalePriceController.fieldState.error ? 'error' : 'default'}
                            />
                        </FormItem>
                        <FormItem label="Stock" invalid={!!stockController.fieldState.error}>
                            <Input
                                {...stockController.field}
                                type="number"
                                step="1"
                                placeholder="0"
                                aria-label="Stock"
                                variant={stockController.fieldState.error ? 'error' : 'default'}
                                onChange={(e) => stockController.field.onChange(e.target.valueAsNumber)}
                            />
                        </FormItem>
                    </div>
                    {cellError(priceController.fieldState.error?.message)}
                    {cellError(wholesalePriceController.fieldState.error?.message)}
                    {cellError(stockController.fieldState.error?.message)}

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">Attributes</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {QUICK_ADD_ATTRIBUTE_KEYS.filter((key) => !hasAttributeKey(key)).map((key) => (
                                    <Button
                                        key={key}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true"/>}
                                        onClick={() => appendAttribute({key, value: ''})}
                                        data-testid={`add-attribute-${key.toLowerCase()}-${index}`}
                                    >
                                        {key}
                                    </Button>
                                ))}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true"/>}
                                    onClick={() => appendAttribute({key: '', value: ''})}
                                    data-testid={`add-attribute-custom-${index}`}
                                >
                                    Custom attribute
                                </Button>
                            </div>
                        </div>

                        {attributeFields.length === 0 ? (
                            <p className="text-xs text-(--c-text-muted)">
                                No attributes yet — add Colour, Size, or a custom attribute.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2 px-0.5 text-xs font-medium text-(--c-text-muted)">
                                    <span className="w-1/3">Name</span>
                                    <span className="flex-1">Value</span>
                                </div>
                                {attributeFields.map((attributeField, attrIndex) => (
                                    <AttributeRow
                                        key={attributeField.id}
                                        control={control}
                                        variantIndex={index}
                                        attrIndex={attrIndex}
                                        onRemove={() => removeAttribute(attrIndex)}
                                    />
                                ))}
                            </div>
                        )}
                        {attributesRootError?.message && (
                            <p role="alert" className="mt-2 text-xs text-(--c-error)">
                                {attributesRootError.message}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

interface AttributeRowProps {
    control: Control<ProductFormValues>
    variantIndex: number
    attrIndex: number
    onRemove: () => void
}

function AttributeRow({control, variantIndex, attrIndex, onRemove}: AttributeRowProps) {
    const keyController = useController({control, name: `variants.${variantIndex}.attributes.${attrIndex}.key`})
    const valueController = useController({control, name: `variants.${variantIndex}.attributes.${attrIndex}.value`})

    return (
        <div data-testid={`variant-${variantIndex}-attribute-${attrIndex}`}>
            <div className="flex items-center gap-2">
                <Input
                    {...keyController.field}
                    placeholder="e.g. Colour"
                    aria-label={`Attribute name (row ${attrIndex + 1})`}
                    variant={keyController.fieldState.error ? 'error' : 'default'}
                    className="w-1/3"
                />
                <Input
                    {...valueController.field}
                    placeholder="e.g. Navy"
                    aria-label={`Attribute value (row ${attrIndex + 1})`}
                    variant={valueController.fieldState.error ? 'error' : 'default'}
                    className="flex-1"
                />
                <RowActionButton
                    variant="danger"
                    onClick={onRemove}
                    data-testid={`remove-attribute-${variantIndex}-${attrIndex}`}
                    aria-label="Remove attribute"
                    title="Remove attribute"
                >
                    <X className="h-4 w-4" aria-hidden="true"/>
                </RowActionButton>
            </div>
            {(keyController.fieldState.error || valueController.fieldState.error) && (
                <p role="alert" className="mt-1 text-xs text-(--c-error)">
                    {keyController.fieldState.error?.message ?? valueController.fieldState.error?.message}
                </p>
            )}
        </div>
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
        append({sku: '', price: '', wholesalePrice: '', stock: 0, attributes: []})
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

            <div className="space-y-2">
                {pageFields.map((field, pageOffset) => {
                    // Controllers and testids address the GLOBAL field
                    // index, not the position within the page.
                    const index = pageStart + pageOffset
                    return (
                        <VariantCard
                            key={field.id}
                            control={control}
                            index={index}
                            hasError={!!errors.variants?.[index]}
                            onRemove={() => remove(index)}
                            disableRemove={fields.length <= 1}
                        />
                    )
                })}
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
