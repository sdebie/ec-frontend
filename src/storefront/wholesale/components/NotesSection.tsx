import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {Textarea} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface NotesSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    errors: FieldErrors<WholesaleApplicationFormInput>
}

export function NotesSection({register, errors}: NotesSectionProps) {
    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Additional Notes</h2>
            <div>
                <Textarea
                    id="notes"
                    rows={4}
                    label="Notes"
                    error={errors.notes?.message}
                    placeholder="Tell us about your business, expected order volumes, or any other relevant details..."
                    {...register('notes')}
                />
                <p className="mt-1 text-xs text-(--sf-muted-text)">Maximum 1000 characters</p>
            </div>
        </section>
    )
}
