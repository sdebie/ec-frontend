import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useStoreSettings } from '@/admin/hooks/settings/useStoreSettings'
import type { StoreSetting } from '@/admin/hooks/settings/types'
import { PageLayout, InputField, Checkbox, toast } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'

// --- GraphQL ---

const SAVE_STORE_SETTINGS = gql`
  mutation SaveStoreSettings($storeSettingsDto: [StoreSettingsDtoInput!]!) {
    saveStoreSettings(storeSettingsDto: $storeSettingsDto) {
      key
      value
      description
    }
  }
`

// --- Types ---

interface NavItemData {
  id: string
  label: string
  path: string
  external: boolean
  sortOrder: number
}

// --- Schema ---

const navItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  path: z.string().min(1, 'Path is required'),
  external: z.boolean(),
  sortOrder: z.number(),
})

const formSchema = z.object({
  items: z.array(navItemSchema),
})

type FormValues = z.infer<typeof formSchema>

// --- Helpers ---

function parseNavItems(settings: StoreSetting[]): NavItemData[] {
  const navSetting = settings.find((s) => s.key === 'storefront.navigation')
  if (!navSetting?.value) return []
  try {
    const parsed = JSON.parse(navSetting.value) as { items?: NavItemData[] }
    return (parsed.items ?? []).sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    return []
  }
}

// --- Component ---

export function NavigationEditorPage() {
  const queryClient = useQueryClient()

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Navigation' },
  ])

  const { data: settings } = useStoreSettings()

  const saveMutation = useMutation({
    mutationFn: async (items: NavItemData[]) => {
      const value = JSON.stringify({ items })
      await adminGraphqlClient.request(SAVE_STORE_SETTINGS, {
        storeSettingsDto: [{ key: 'storefront.navigation', value }],
      })
    },
    onSuccess: () => {
      toast.success('Navigation saved successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] })
    },
    onError: () => {
      toast.error('Failed to save navigation', { duration: 0 })
    },
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [] },
  })

  const { fields, append, remove, swap } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (settings) reset({ items: parseNavItems(settings) })
  }, [settings, reset])

  function handleAddItem() {
    append({
      id: crypto.randomUUID(),
      label: '',
      path: '',
      external: false,
      sortOrder: fields.length,
    })
  }

  function onSubmit(data: FormValues) {
    saveMutation.mutate(
      data.items.map((item, index) => ({ ...item, sortOrder: index })),
    )
  }

  const headerAction = (
    <Button
      type="submit"
      form="nav-editor-form"
      variant="solid"
      disabled={saveMutation.isPending}
    >
      {saveMutation.isPending ? 'Saving…' : 'Save'}
    </Button>
  )

  return (
    <PageLayout title="Navigation Editor" action={headerAction}>
      <form id="nav-editor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
        {fields.length === 0 && (
          <p className="text-sm text-(--c-text-muted)">
            No navigation items configured. Add one below.
          </p>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-(--c-text-muted)">
                Item {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => swap(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 rounded-lg hover:bg-(--c-surface-hover) disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Move item ${index + 1} up`}
                >
                  <ArrowUp className="w-4 h-4 text-(--c-text-muted)" />
                </button>
                <button
                  type="button"
                  onClick={() => swap(index, index + 1)}
                  disabled={index === fields.length - 1}
                  className="p-1 rounded-lg hover:bg-(--c-surface-hover) disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Move item ${index + 1} down`}
                >
                  <ArrowDown className="w-4 h-4 text-(--c-text-muted)" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 rounded-lg hover:bg-(--c-status-red-bg) text-(--c-status-red-text)"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Label"
                placeholder="e.g. Shop"
                error={errors.items?.[index]?.label?.message}
                {...register(`items.${index}.label`)}
              />
              <InputField
                label="Path"
                placeholder="e.g. /products"
                error={errors.items?.[index]?.path?.message}
                {...register(`items.${index}.path`)}
              />
            </div>

            <Controller
              control={control}
              name={`items.${index}.external`}
              render={({ field: externalField }) => (
                <Checkbox
                  label="Open in new tab (external link)"
                  checked={externalField.value}
                  onChange={externalField.onChange}
                />
              )}
            />
          </div>
        ))}

        <div className="pt-2">
          <Button type="button" variant="outline" onClick={handleAddItem}>
            <Plus className="w-4 h-4" />
            Add item
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}
