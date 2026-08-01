import { useState, useMemo } from 'react'
import { parseAttributes } from '../utils/variantAttributes'

interface Variant {
  id: string
  retailPrice: number | null
  wholesalePrice: number | null
  retailSalePrice: number | null
  wholesaleSalePrice: number | null
  stockQuantity: number | null
  attributesJson: string
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedVariant: Variant | null
  onSelectionChange: (attrs: Record<string, string>) => void
}

export function VariantSelector(props: VariantSelectorProps) {
  const { variants, onSelectionChange } = props
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})

  const parsedVariants = useMemo(
    () =>
      variants.map((variant) => ({
        variant,
        attributes: parseAttributes(variant.attributesJson),
      })),
    [variants]
  )

  const attributeGroups = useMemo(() => {
    const groups: Record<string, Set<string>> = {}
    for (const { attributes } of parsedVariants) {
      for (const [key, value] of Object.entries(attributes)) {
        if (!groups[key]) {
          groups[key] = new Set()
        }
        groups[key].add(value)
      }
    }
    return Object.entries(groups).map(([key, values]) => ({
      key,
      values: Array.from(values),
    }))
  }, [parsedVariants])

  function isOptionDisabled(key: string, value: string): boolean {
    const matchingVariants = parsedVariants.filter(
      ({ attributes }) => attributes[key] === value
    )
    if (matchingVariants.length === 0) return true
    return matchingVariants.every(
      ({ variant }) =>
        variant.stockQuantity === 0 || variant.stockQuantity === null
    )
  }

  function handleOptionClick(key: string, value: string) {
    const newAttrs = { ...selectedAttrs, [key]: value }
    setSelectedAttrs(newAttrs)
    onSelectionChange(newAttrs)
  }

  if (attributeGroups.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {attributeGroups.map(({ key, values }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-(--sf-text) mb-2">
            {key}
          </label>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedAttrs[key] === value
              const isDisabled = isOptionDisabled(key, value)

              return (
                <button
                  key={value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleOptionClick(key, value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isSelected
                      ? 'bg-(--sf-accent) text-(--sf-accent-text)'
                      : 'border border-(--sf-border) text-(--sf-text) hover:border-(--sf-accent)'
                  } ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed line-through'
                      : 'cursor-pointer'
                  }`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
