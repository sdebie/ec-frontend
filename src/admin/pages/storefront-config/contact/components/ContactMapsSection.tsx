import {useWatch, type Control, type UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import {isApprovedMapEmbedUrl} from '@/shared/utils/contactMapUrls'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactMapsSectionProps {
    register: UseFormRegister<ContactFormValues>
    control: Control<ContactFormValues>
    mapUrlError?: string
    mapEmbedUrlError?: string
    canEdit: boolean
}

export function ContactMapsSection({register, control, mapUrlError, mapEmbedUrlError, canEdit}: ContactMapsSectionProps) {
    const mapEmbedUrl = useWatch({control, name: 'mapEmbedUrl'})
    const showPreview = !!mapEmbedUrl && isApprovedMapEmbedUrl(mapEmbedUrl)

    return (
        <div>
            <div className="space-y-4">
                <InputField
                    label="Map URL (external directions link)"
                    placeholder="https://www.google.com/maps/place/..."
                    helperText="Must be a valid HTTPS URL"
                    error={mapUrlError}
                    disabled={!canEdit}
                    {...register('mapUrl')}
                />
                <InputField
                    label="Map Embed URL"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    helperText="Google Maps or OpenStreetMap embed URLs only"
                    error={mapEmbedUrlError}
                    disabled={!canEdit}
                    {...register('mapEmbedUrl')}
                />
            </div>

            <div className="mt-4">
                {showPreview ? (
                    <div className="overflow-hidden rounded-(--c-radius) border border-(--c-border)">
                        <iframe
                            src={mapEmbedUrl}
                            title="Map preview"
                            className="size-full min-h-96 border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                ) : (
                    <div className="flex min-h-40 items-center justify-center rounded-(--c-radius) border border-dashed border-(--c-border) text-sm text-(--c-text-muted)">
                        Enter an approved map embed URL to see a preview.
                    </div>
                )}
            </div>
        </div>
    )
}
