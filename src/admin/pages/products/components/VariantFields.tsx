import { useController, type Control, type UseFieldArrayReturn } from 'react-hook-form'
import { Button, Input } from '@/shared/ui/primitives'
import { FormItem, Label } from '@/shared/ui/components'
// Operate on the parent product form's values — don't duplicate the shape.
import type { ProductFormValues } from './ProductForm'

interface VariantFieldsProps {
  control: Control<ProductFormValues>
  fields: UseFieldArrayReturn<ProductFormValues, 'variants'>['fields']
  append: UseFieldArrayReturn<ProductFormValues, 'variants'>['append']
  remove: UseFieldArrayReturn<ProductFormValues, 'variants'>['remove']
}

function VariantRow({
  control,
  index,
  onRemove,
  disableRemove,
}: {
  control: Control<ProductFormValues>
  index: number
  onRemove: () => void
  disableRemove: boolean
}) {
  const skuController = useController({
    control,
    name: `variants.${index}.sku`,
  })

  const priceController = useController({
    control,
    name: `variants.${index}.price`,
  })

  const stockController = useController({
    control,
    name: `variants.${index}.stock`,
  })

  return (
    <div
      data-testid={`variant-row-${index}`}
      className="flex items-start gap-3 rounded-(--c-radius) border border-(--c-border) p-4"
    >
      <div className="flex-1">
        <FormItem
          label="SKU"
          required
          invalid={!!skuController.fieldState.error}
          errorMessage={skuController.fieldState.error?.message}
        >
          <Input
            {...skuController.field}
            placeholder="e.g. PROD-001"
            variant={skuController.fieldState.error ? 'error' : 'default'}
          />
        </FormItem>
      </div>

      <div className="flex-1">
        <FormItem
          label="Price"
          required
          invalid={!!priceController.fieldState.error}
          errorMessage={priceController.fieldState.error?.message}
        >
          <Input
            {...priceController.field}
            type="text"
            inputMode="decimal"
            placeholder="e.g. 99.99"
            variant={priceController.fieldState.error ? 'error' : 'default'}
          />
        </FormItem>
      </div>

      <div className="flex-1">
        <FormItem
          label="Stock"
          required
          invalid={!!stockController.fieldState.error}
          errorMessage={stockController.fieldState.error?.message}
        >
          <Input
            {...stockController.field}
            type="number"
            step="1"
            placeholder="0"
            variant={stockController.fieldState.error ? 'error' : 'default'}
            onChange={(e) => stockController.field.onChange(e.target.valueAsNumber)}
          />
        </FormItem>
      </div>

      <div className="pt-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disableRemove}
          onClick={onRemove}
          data-testid={`remove-variant-${index}`}
        >
          Remove
        </Button>
      </div>
    </div>
  )
}

export function VariantFields({ control, fields, append, remove }: VariantFieldsProps) {
  return (
    <div className="space-y-4">
      <Label>Variants</Label>

      {fields.map((field, index) => (
        <VariantRow
          key={field.id}
          control={control}
          index={index}
          onRemove={() => remove(index)}
          disableRemove={fields.length <= 1}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ sku: '', price: '', stock: 0 })}
        data-testid="add-variant"
      >
        Add Variant
      </Button>
    </div>
  )
}
