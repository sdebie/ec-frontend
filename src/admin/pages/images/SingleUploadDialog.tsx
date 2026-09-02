import {useState} from 'react'
import {Dialog, DialogContent, DialogFooter, DialogHeader, Select, Upload} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useImageDirectories} from './hooks/useImageDirectories'
import {useUploadImage} from './hooks/useUploadImage'

interface SingleUploadDialogProps {
    open: boolean
    onClose: () => void
}

export function SingleUploadDialog({open, onClose}: SingleUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [directory, setDirectory] = useState('')
    const [uploadKey, setUploadKey] = useState(0)

    const {data: directories} = useImageDirectories()
    const uploadMutation = useUploadImage()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return
        uploadMutation.mutate(
            {file, directory},
            {
                onSuccess: () => {
                    setFile(null)
                    setDirectory('')
                    setUploadKey((k) => k + 1)
                    onClose()
                },
            }
        )
    }

    const handleClose = () => {
        setFile(null)
        setDirectory('')
        setUploadKey((k) => k + 1)
        onClose()
    }

    const directoryOptions = [
        {value: '', label: 'Storage root'},
        ...(directories?.map((dir) => ({value: dir, label: dir})) ?? []),
    ]

    return (
        <Dialog open={open} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogHeader title="Upload Image"/>

                <DialogContent>
                    <div className="flex flex-col gap-4">
                        <Upload
                            key={uploadKey}
                            accept="image/jpeg,image/png,image/webp"
                            onUpload={setFile}
                            disabled={uploadMutation.isPending}
                        />
                        <Select
                            label="Destination directory"
                            options={directoryOptions}
                            value={directory}
                            onChange={(value) => setDirectory(value)}
                        />
                    </div>
                </DialogContent>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        disabled={!file || uploadMutation.isPending}
                    >
                        {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    )
}
