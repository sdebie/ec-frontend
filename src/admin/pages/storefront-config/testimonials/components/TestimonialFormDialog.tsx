import {Controller, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Form,
    FormItem,
    Switcher,
    Textarea,
} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {useCreateTestimonial} from '../hooks/useCreateTestimonial'
import {useUpdateTestimonial} from '../hooks/useUpdateTestimonial'
import {type TestimonialFormData, testimonialFormSchema} from '../schema'
import type {AdminTestimonial} from '../types'

interface TestimonialFormDialogProps {
    open: boolean
    testimonial: AdminTestimonial | null
    onClose: () => void
}

export function TestimonialFormDialog({open, testimonial, onClose}: TestimonialFormDialogProps) {
    const createTestimonial = useCreateTestimonial()
    const updateTestimonial = useUpdateTestimonial()

    const {
        register,
        handleSubmit,
        control,
        formState: {errors},
    } = useForm<TestimonialFormData>({
        resolver: zodResolver(testimonialFormSchema),
        defaultValues: testimonial
            ? {
                quote: testimonial.quote,
                authorName: testimonial.authorName,
                authorTitle: testimonial.authorTitle ?? '',
                sortOrder: testimonial.sortOrder,
                published: testimonial.published,
            }
            : {quote: '', authorName: '', authorTitle: '', sortOrder: 0, published: false},
    })

    const onSubmit = (data: TestimonialFormData) => {
        const payload = {
            quote: data.quote,
            authorName: data.authorName,
            authorTitle: data.authorTitle || undefined,
            sortOrder: data.sortOrder,
            published: data.published,
        }

        if (testimonial) {
            updateTestimonial.mutate({id: testimonial.id, payload}, {onSuccess: onClose})
        } else {
            createTestimonial.mutate(payload, {onSuccess: onClose})
        }
    }

    return (
        <Dialog open={open} onClose={onClose} size="lg">
            <DialogHeader title={testimonial ? 'Edit Testimonial' : 'Add Testimonial'}/>
            <DialogContent>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="Quote" required invalid={!!errors.quote} errorMessage={errors.quote?.message}>
                        <Textarea
                            rows={4}
                            className="resize-y"
                            placeholder="Enter the customer testimonial..."
                            {...register('quote')}
                        />
                    </FormItem>

                    <FormItem
                        label="Author Name"
                        required
                        invalid={!!errors.authorName}
                        errorMessage={errors.authorName?.message}
                    >
                        <Input
                            placeholder="e.g. Jane Smith"
                            variant={errors.authorName ? 'error' : 'default'}
                            {...register('authorName')}
                        />
                    </FormItem>

                    <FormItem
                        label="Author Title"
                        invalid={!!errors.authorTitle}
                        errorMessage={errors.authorTitle?.message}
                    >
                        <Input
                            placeholder="e.g. CEO, Acme Corp (optional)"
                            variant={errors.authorTitle ? 'error' : 'default'}
                            {...register('authorTitle')}
                        />
                    </FormItem>

                    <FormItem label="Sort Order" invalid={!!errors.sortOrder} errorMessage={errors.sortOrder?.message}>
                        <Input
                            type="number"
                            min={0}
                            variant={errors.sortOrder ? 'error' : 'default'}
                            {...register('sortOrder', {valueAsNumber: true})}
                        />
                    </FormItem>

                    <FormItem label="Published" invalid={!!errors.published} errorMessage={errors.published?.message}>
                        <Controller
                            name="published"
                            control={control}
                            render={({field}) => (
                                <Switcher
                                    checked={field.value}
                                    onChange={(checked) => field.onChange(checked)}
                                    label={field.value ? 'Published' : 'Draft'}
                                />
                            )}
                        />
                    </FormItem>

                    <DialogFooter>
                        <Button variant="ghost" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            isLoading={createTestimonial.isPending || updateTestimonial.isPending}
                        >
                            {testimonial ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
