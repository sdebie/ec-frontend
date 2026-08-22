import {useRef, useState} from 'react'

import {Dialog, DialogContent, DialogFooter, DialogHeader, Select, toast, Upload} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useBulkUpload} from './hooks/useBulkUpload'
import {useImageDirectories} from './hooks/useImageDirectories'
import {isImageFile} from './imageFileValidation'

interface BulkUploadDialogProps {
    open: boolean
    onClose: () => void
}

type UploadMode = 'files' | 'folder'

export function BulkUploadDialog({open, onClose}: BulkUploadDialogProps) {

    const [mode, setMode] = useState<UploadMode>('files')
    const [directory, setDirectory] = useState('')

    // Files mode
    const [filesSelected, setFilesSelected] = useState<File[]>([])
    const [filesSkipped, setFilesSkipped] = useState(0)
    const [filesUploadKey, setFilesUploadKey] = useState(0)

    // Folder mode — two-step flow: pre-confirm → picker → review → upload
    const folderInputRef = useRef<HTMLInputElement>(null)
    const [preConfirmOpen, setPreConfirmOpen] = useState(false)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [folderFiles, setFolderFiles] = useState<File[]>([])

    // Shared
    const [result, setResult] = useState<{ uploaded: number; skipped: number } | null>(null)

    const {data: directories} = useImageDirectories()
    const {upload, progress, isUploading} = useBulkUpload()

    const destinationLabel = directory || 'Storage root'

    const directoryOptions = [
        {value: '', label: 'Storage root'},
        ...(directories?.map((dir) => ({value: dir, label: dir})) ?? []),
    ]

    // --- Files mode handlers ---

    const handleFilesChange = (incoming: File[]) => {
        const valid = incoming.filter(isImageFile)
        setFilesSelected(valid)
        setFilesSkipped(incoming.length - valid.length)
        setResult(null)
    }

    const handleFilesUpload = async () => {
        if (filesSelected.length === 0) return
        try {
            const uploadResult = await upload(filesSelected, directory)
            setResult(uploadResult)
            setFilesSelected([])
            setFilesUploadKey((k) => k + 1)
            if (uploadResult.uploaded > 0) {
                toast.success(`${uploadResult.uploaded} image${uploadResult.uploaded !== 1 ? 's' : ''} uploaded successfully`)
            }
        } catch (err) {
            console.error('Bulk file upload failed:', err)
        }
    }

    // --- Folder mode handlers ---

    const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const all = Array.from(e.target.files ?? [])
        const images = all.filter(isImageFile)
        setFolderFiles(images)
        // Reset input so the same folder can be re-selected
        if (folderInputRef.current) folderInputRef.current.value = ''
        if (images.length > 0) setReviewOpen(true)
    }

    const handleFolderUpload = async () => {
        if (folderFiles.length === 0) return
        try {
            const uploadResult = await upload(folderFiles, directory)
            setResult(uploadResult)
            setReviewOpen(false)
            setFolderFiles([])
            if (uploadResult.uploaded > 0) {
                toast.success(`${uploadResult.uploaded} image${uploadResult.uploaded !== 1 ? 's' : ''} uploaded successfully`)
            }
        } catch (err) {
            console.error('Bulk folder upload failed:', err)
        }
    }

    // --- Mode switch ---

    const handleModeChange = (next: UploadMode) => {
        setMode(next)
        setFilesSelected([])
        setFilesSkipped(0)
        setFolderFiles([])
        setResult(null)
        setFilesUploadKey((k) => k + 1)
    }

    // --- Dialog close ---

    const handleClose = () => {
        setMode('files')
        setDirectory('')
        setFilesSelected([])
        setFilesSkipped(0)
        setFolderFiles([])
        setResult(null)
        setPreConfirmOpen(false)
        setReviewOpen(false)
        setFilesUploadKey((k) => k + 1)
        onClose()
    }

    const progressPercent = progress ? (progress.currentBatch / progress.totalBatches) * 100 : 0

    return (
        <>
            <Dialog open={open} onClose={handleClose} size="lg">
                <DialogHeader title="Bulk Upload Images"/>

                <DialogContent>
                    <div className="flex flex-col gap-4">
                        {/* Mode toggle */}
                        <div
                            className="flex items-center gap-1 rounded-lg border border-(--c-border) bg-(--c-panel) p-1 w-fit">
                            {(['files', 'folder'] as UploadMode[]).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleModeChange(m)}
                                    className={[
                                        'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                                        mode === m
                                            ? 'bg-(--c-accent) text-(--c-accent-text)'
                                            : 'text-(--c-text-muted) hover:text-(--c-text)',
                                    ].join(' ')}
                                >
                                    {m === 'files' ? 'Select Files' : 'Select Folder'}
                                </button>
                            ))}
                        </div>

                        <Select
                            label="Destination directory"
                            options={directoryOptions}
                            value={directory}
                            onChange={setDirectory}
                        />

                        {mode === 'files' && (
                            <>
                                <Upload
                                    key={filesUploadKey}
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onFilesChange={handleFilesChange}
                                    disabled={isUploading}
                                />
                                {filesSkipped > 0 && (
                                    <p className="text-sm text-(--c-status-amber-text)">
                                        {filesSkipped} file(s) skipped — JPEG, PNG and WebP only
                                    </p>
                                )}
                            </>
                        )}

                        {mode === 'folder' && (
                            <>
                                {/* Hidden folder input — triggered programmatically after pre-confirm */}
                                <input
                                    ref={folderInputRef}
                                    type="file"
                                    multiple
                                    className="sr-only"
                                    onChange={handleFolderInputChange}
                                    {...({
                                        webkitdirectory: '',
                                        directory: ''
                                    } as React.InputHTMLAttributes<HTMLInputElement>)}
                                />
                                <div
                                    className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-(--c-border) px-6 py-8 text-center">
                                    <Button
                                        type="button"
                                        variant="solid"
                                        disabled={isUploading}
                                        onClick={() => setPreConfirmOpen(true)}
                                    >
                                        Select Images Folder
                                    </Button>
                                    <p className="text-sm text-(--c-text-muted)">
                                        Images must be named as <span
                                        className="font-medium text-(--c-text)">[SKU].jpg</span>
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Progress — shown during upload in files mode */}
                        {mode === 'files' && isUploading && progress && (
                            <div className="space-y-2">
                                <p className="text-sm text-(--c-text-muted)">
                                    Batch {progress.currentBatch} of {progress.totalBatches}
                                </p>
                                <div className="h-2 w-full rounded-full bg-(--c-border)">
                                    <div
                                        className="h-2 rounded-full bg-(--c-accent) transition-all"
                                        style={{width: `${progressPercent}%`}}
                                    />
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4 text-sm space-y-1">
                                <p className="text-(--c-text)">
                                    <span
                                        className="font-medium">{result.uploaded}</span> image{result.uploaded !== 1 ? 's' : ''} uploaded
                                    to{' '}
                                    <span className="font-medium">{destinationLabel}</span>
                                </p>
                                {result.skipped > 0 && (
                                    <p className="text-(--c-text-muted)">{result.skipped} skipped</p>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        {result ? 'Done' : 'Cancel'}
                    </Button>
                    {mode === 'files' && !result && (
                        <Button
                            type="button"
                            variant="solid"
                            onClick={handleFilesUpload}
                            disabled={filesSelected.length === 0 || isUploading}
                        >
                            {isUploading
                                ? 'Uploading…'
                                : `Upload${filesSelected.length > 0 ? ` (${filesSelected.length} image${filesSelected.length !== 1 ? 's' : ''})` : ''}`}
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>

            <Dialog open={preConfirmOpen} onClose={() => setPreConfirmOpen(false)} size="md">
                <DialogHeader
                    title="Folder Upload Confirmation"
                    description={`You are about to select a folder for bulk image upload into ${destinationLabel}.`}
                />
                <DialogContent>
                    <div className="space-y-4">
                        <p className="text-sm text-(--c-text-muted)">
                            Your browser will ask for permission to access the folder contents. This is a standard
                            security measure.
                        </p>
                        <div
                            className="rounded border border-(--c-border) bg-(--c-bg) px-3 py-2 text-sm text-(--c-text-muted)">
                            Destination:{' '}
                            <span className="font-medium text-(--c-text)">{destinationLabel}</span>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPreConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="solid"
                        onClick={() => {
                            setPreConfirmOpen(false)
                            folderInputRef.current?.click()
                        }}
                    >
                        Proceed
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Folder review dialog — shown after folder picker, before upload starts */}
            <Dialog open={reviewOpen} onClose={() => {
                setReviewOpen(false);
                setFolderFiles([])
            }} size="md">
                <DialogHeader
                    title="Review Bulk Upload"
                    description={`${folderFiles.length} image${folderFiles.length !== 1 ? 's' : ''} found for ${destinationLabel}.`}
                />
                <DialogContent>
                    <div className="space-y-4">
                        <div
                            className="rounded border border-(--c-border) bg-(--c-bg) px-3 py-2 text-sm text-(--c-text-muted)">
                            Destination:{' '}
                            <span className="font-medium text-(--c-text)">
                                {destinationLabel}
                            </span>
                        </div>
                        <div
                            className="grid grid-cols-2 gap-2 text-xs bg-(--c-bg) p-3 rounded border border-(--c-border) max-h-60 overflow-y-auto">
                            {folderFiles.map((file, idx) => (
                                <div key={idx} className="truncate text-(--c-text-muted)">
                                    📄 {file.name}
                                </div>
                            ))}
                        </div>
                        {isUploading && progress && (
                            <div className="space-y-2">
                                <p className="text-sm text-(--c-text-muted)">
                                    Batch {progress.currentBatch} of {progress.totalBatches}
                                </p>
                                <div className="h-2 w-full rounded-full bg-(--c-border)">
                                    <div
                                        className="h-2 rounded-full bg-(--c-accent) transition-all"
                                        style={{width: `${progressPercent}%`}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setReviewOpen(false);
                            setFolderFiles([])
                        }}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="solid"
                        onClick={handleFolderUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? `Uploading batch ${progress?.currentBatch ?? 1} of ${progress?.totalBatches ?? 1}…` : 'Confirm & Start Upload'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    )
}
