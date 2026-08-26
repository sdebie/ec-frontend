import {Plus} from 'lucide-react'
import type {Control, FieldErrors, UseFormRegister} from 'react-hook-form'
import {Button} from '@/shared/ui/primitives'
import {ContactSectionHeading} from './ContactSectionHeading'
import {ContactSocialLinkRow} from './ContactSocialLinkRow'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactSocialSectionProps {
    register: UseFormRegister<ContactFormValues>
    control: Control<ContactFormValues>
    fields: {id: string}[]
    errors: FieldErrors<ContactFormValues>['socialLinks']
    onAdd: () => void
    onRemove: (index: number) => void
    canEdit: boolean
}

/** Social media profile links shown in the storefront footer and announcement bar. */
export function ContactSocialSection({register, control, fields, errors, onAdd, onRemove, canEdit}: ContactSocialSectionProps) {
    return (
        <div>
            <ContactSectionHeading
                title="Social"
                description="Links to your store's social media profiles, shown in the storefront footer."
            />

            <div className="flex flex-col gap-3">
                {canEdit && (
                    <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4"/>} onClick={onAdd}>
                            Add social link
                        </Button>
                    </div>
                )}

                {fields.length === 0 ? (
                    <p className="text-sm text-(--c-text-muted)">No social links configured.</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-(--c-border)">
                        <table className="w-full text-sm text-left text-(--c-text)">
                            <thead className="text-xs font-semibold text-(--c-text-muted) bg-(--c-surface-hover) border-b border-(--c-border)">
                                <tr>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">URL</th>
                                    <th className="px-4 py-3">Icon</th>
                                    {canEdit && <th className="px-4 py-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--c-border)">
                                {fields.map((field, index) => (
                                    <ContactSocialLinkRow
                                        key={field.id}
                                        index={index}
                                        control={control}
                                        registerLabel={register(`socialLinks.${index}.label`)}
                                        registerTo={register(`socialLinks.${index}.to`)}
                                        errors={errors?.[index]}
                                        onRemove={() => onRemove(index)}
                                        canEdit={canEdit}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
