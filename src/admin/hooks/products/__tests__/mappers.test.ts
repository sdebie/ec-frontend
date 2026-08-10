import { describe, it, expect } from 'vitest'
import { parseAttributesJson, serializeAttributes, toProductInformationInput } from '../mappers'
import type { ProductPayload } from '../types'

describe('serializeAttributes', () => {
  it('serialises ordered key/value rows to a JSON object string', () => {
    expect(serializeAttributes([{ key: 'Colour', value: 'Navy' }, { key: 'Size', value: 'L' }]))
      .toBe('{"Colour":"Navy","Size":"L"}')
  })

  it('returns a valid empty object, never null or empty string, for no attributes', () => {
    // The backend only overwrites attributesJson on update when the incoming
    // value is non-null — '{}' is what actually clears a variant's attributes.
    expect(serializeAttributes([])).toBe('{}')
  })

  it('trims surrounding whitespace from both key and value', () => {
    expect(serializeAttributes([{ key: '  Colour  ', value: '  Navy  ' }]))
      .toBe('{"Colour":"Navy"}')
  })

  it('drops rows where the key or value is blank (or whitespace-only) after trimming', () => {
    expect(serializeAttributes([
      { key: 'Colour', value: '' },
      { key: '', value: 'Navy' },
      { key: '   ', value: '   ' },
      { key: 'Size', value: 'L' },
    ])).toBe('{"Size":"L"}')
  })
})

describe('parseAttributesJson', () => {
  it('parses a JSON object into ordered {key, value} rows', () => {
    expect(parseAttributesJson('{"Colour":"Navy","Size":"L"}')).toEqual([
      { key: 'Colour', value: 'Navy' },
      { key: 'Size', value: 'L' },
    ])
  })

  it('returns [] for null, undefined, and empty string', () => {
    expect(parseAttributesJson(null)).toEqual([])
    expect(parseAttributesJson(undefined)).toEqual([])
    expect(parseAttributesJson('')).toEqual([])
  })

  it('returns [] for malformed JSON instead of throwing', () => {
    expect(parseAttributesJson('{not valid json')).toEqual([])
  })

  it('returns [] for a JSON array or a JSON primitive (only a plain object is a valid attribute map)', () => {
    expect(parseAttributesJson('["Colour","Navy"]')).toEqual([])
    expect(parseAttributesJson('"Navy"')).toEqual([])
    expect(parseAttributesJson('42')).toEqual([])
  })

  it('coerces a non-string JSON value to its string form', () => {
    // Legacy import data occasionally carries a numeric-looking attribute value.
    expect(parseAttributesJson('{"Quantity":20}')).toEqual([{ key: 'Quantity', value: '20' }])
  })

  it('round-trips through serializeAttributes', () => {
    const original = [{ key: 'Colour', value: 'Navy' }, { key: 'Size', value: 'L' }]
    expect(parseAttributesJson(serializeAttributes(original))).toEqual(original)
  })
})

describe('toProductInformationInput — attributesJson mapping', () => {
  const basePayload: ProductPayload = {
    name: 'Test',
    slug: 'test',
    shortDescription: '',
    description: '',
    status: 'ACTIVE' as ProductPayload['status'],
    categoryIds: ['cat-1'],
    images: [],
    variants: [],
  }

  it('always includes attributesJson, serialised from the variant’s attribute rows', () => {
    const input = toProductInformationInput({
      ...basePayload,
      variants: [
        { sku: 'SKU-1', price: '10.00', stock: 1, attributes: [{ key: 'Colour', value: 'Navy' }] },
        { sku: 'SKU-2', price: '20.00', stock: 2, attributes: [] },
      ],
    })

    expect(input.variants[0].attributesJson).toBe('{"Colour":"Navy"}')
    expect(input.variants[1].attributesJson).toBe('{}')
  })
})
