import {Plus} from 'lucide-react'
import {Button} from '@/shared/ui/primitives'

interface TestimonialToolbarProps {
    canEdit: boolean
    onAddTestimonial: () => void
}

export function TestimonialToolbar({canEdit, onAddTestimonial}: TestimonialToolbarProps) {
    if (!canEdit) return null

    return (
        <div className="flex justify-end">
            <Button
                variant="solid"
                onClick={onAddTestimonial}
                leftIcon={<Plus className="h-4 w-4"/>}
                className="w-full sm:w-auto"
            >
                Add Testimonial
            </Button>
        </div>
    )
}
