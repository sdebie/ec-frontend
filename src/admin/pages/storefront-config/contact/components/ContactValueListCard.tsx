import {type ReactNode, useState} from 'react'
import {ChevronLeft, ChevronRight, Plus, Trash2} from 'lucide-react'
import type {FieldErrors, UseFormRegisterReturn} from 'react-hook-form'

import {InputField, RowActionButton} from '@/shared/ui/components'
import {Button, Card} from '@/shared/ui/primitives'
import {ContactPanelHeader} from './ContactPanelHeader'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactValueListCardProps {
    icon: ReactNode
    title: string
    description: string
    addLabel: string
    columnLabel: string
    fields: { id: string }[]
    errors: FieldErrors<ContactFormValues>['emails'] | FieldErrors<ContactFormValues>['phones']
    registerValue: (index: number) => UseFormRegisterReturn
    onAdd: () => void
    onRemove: (index: number) => void
    canEdit: boolean
    placeholder: string
    inputType: 'email' | 'tel'
    emptyMessage: string
}

/**
 * Three keeps every page the same height regardless of how many rows are on
 * it (the filler rows below pad the last, short page out) — same technique as
 * OrderLineItemsTable, applied here so Email Addresses and Phone Numbers stay
 * visually matched no matter how many entries either one has.
 */
const PAGE_SIZE = 3

/** Table with an always-editable input per row — Email Addresses and Phone Numbers share this exact structural pattern. */
export function ContactValueListCard({
                                         icon,
                                         title,
                                         description,
                                         addLabel,
                                         columnLabel,
                                         fields,
                                         errors,
                                         registerValue,
                                         onAdd,
                                         onRemove,
                                         canEdit,
                                         placeholder,
                                         inputType,
                                         emptyMessage,
                                     }: ContactValueListCardProps) {
    const [page, setPage] = useState(0)
    const pageCount = Math.max(1, Math.ceil(fields.length / PAGE_SIZE))
    const current = Math.min(page, pageCount - 1)
    const start = current * PAGE_SIZE
    const visibleFields = fields.slice(start, start + PAGE_SIZE)

    function handleAdd() {
        // The new row lands at index `fields.length` — jump to whichever page
        // that index falls on so it's immediately visible for typing.
        setPage(Math.floor(fields.length / PAGE_SIZE))
        onAdd()
    }

    return (
        <Card as="section" variant="bordered" className="flex h-full flex-col">
            <ContactPanelHeader
                icon={icon}
                title={title}
                description={description}
                action={
                    canEdit && (
                        <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4"/>}
                                onClick={handleAdd}>
                            {addLabel}
                        </Button>
                    )
                }
            />
            <Card.Body className="flex-1 px-5 py-4">
                {fields.length === 0 ? (
                    <p className="text-sm text-(--c-text-muted)">{emptyMessage}</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="overflow-x-auto rounded-md border border-(--c-border)">
                            <table className="w-full text-sm text-left text-(--c-text)">
                                <thead
                                    className="text-xs font-semibold text-(--c-text-muted) bg-(--c-surface-hover) border-b border-(--c-border)">
                                <tr>
                                    <th className="px-4 py-3">{columnLabel}</th>
                                    {canEdit && <th className="px-4 py-3 text-right">Actions</th>}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-(--c-border)">
                                {visibleFields.map((field, i) => {
                                    const index = start + i
                                    const error = errors?.[index]?.value?.message

                                    return (
                                        <tr key={field.id}>
                                            <td className="px-4 py-3">
                                                <InputField
                                                    type={inputType}
                                                    placeholder={placeholder}
                                                    error={error}
                                                    disabled={!canEdit}
                                                    aria-label={`${title} ${index + 1}`}
                                                    {...registerValue(index)}
                                                />
                                            </td>
                                            {canEdit && (
                                                <td className="px-4 py-3 text-right align-top">
                                                    <RowActionButton
                                                        variant="danger"
                                                        onClick={() => onRemove(index)}
                                                        aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </RowActionButton>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}

                                {pageCount > 1 && Array.from({length: PAGE_SIZE - visibleFields.length}).map((_, i) => (
                                    <tr key={`filler-${i}`} aria-hidden="true">
                                        <td className="px-4 py-3" colSpan={canEdit ? 2 : 1}>
                                            {/* Matches a populated row's height so every page is the same height. */}
                                            <div className="h-9"/>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {pageCount > 1 && (
                            <div className="flex items-center justify-between text-xs text-(--c-text-muted)">
                                <span>
                                    {start + 1}–{start + visibleFields.length} of {fields.length}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPage(current - 1)}
                                        disabled={current === 0}
                                        aria-label={`Previous page of ${title.toLowerCase()}`}
                                        className="inline-flex items-center justify-center rounded-md p-1 hover:bg-(--c-surface-hover) disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <ChevronLeft className="h-4 w-4"/>
                                    </button>
                                    <span>
                                        {current + 1} / {pageCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage(current + 1)}
                                        disabled={current >= pageCount - 1}
                                        aria-label={`Next page of ${title.toLowerCase()}`}
                                        className="inline-flex items-center justify-center rounded-md p-1 hover:bg-(--c-surface-hover) disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <ChevronRight className="h-4 w-4"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}
