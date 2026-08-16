import {Upload as UploadIcon, X} from 'lucide-react'
import * as React from 'react'
import {cn} from '@/shared/utils/cn'

export interface UploadProps {
    onUpload?: (file: File) => void
    onFilesChange?: (files: File[]) => void
    accept?: string
    multiple?: boolean
    directory?: boolean
    disabled?: boolean
    className?: string
}

export const Upload: React.FC<UploadProps> = ({
                                                  onUpload,
                                                  onFilesChange,
                                                  accept,
                                                  multiple = false,
                                                  directory = false,
                                                  disabled = false,
                                                  className,
                                              }) => {
    const [dragActive, setDragActive] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return

        const filesArray = Array.from(fileList)

        if (onFilesChange) {
            setSelectedFiles(filesArray)
            onFilesChange(filesArray)
        } else if (multiple) {
            setSelectedFiles((prev) => [...prev, ...filesArray])
            filesArray.forEach((file) => onUpload?.(file))
        } else {
            setSelectedFiles([filesArray[0]])
            onUpload?.(filesArray[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (!disabled) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const handleRemove = (index: number) => {
        setSelectedFiles((prev) => {
            const updated = prev.filter((_, i) => i !== index)
            onFilesChange?.(updated)
            return updated
        })
    }

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click()
        }
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-(--c-border) bg-(--c-panel) px-6 py-8 text-center transition-colors cursor-pointer',
                    dragActive && 'border-(--c-accent) bg-(--c-bg)',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && !dragActive && 'hover:border-(--c-accent) hover:bg-(--c-bg)'
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={directory ? undefined : accept}
                    multiple={multiple || directory}
                    onChange={handleChange}
                    disabled={disabled}
                    className="sr-only"
                    {...(directory ? {
                        webkitdirectory: '',
                        directory: ''
                    } as React.InputHTMLAttributes<HTMLInputElement> : {})}
                />
                <UploadIcon className="w-10 h-10 text-(--c-text-muted) mb-3"/>
                <p className="text-sm text-(--c-text) mb-1">
                    <span className="font-medium text-(--c-accent)">Click to upload</span>{' '}
                    or drag and drop
                </p>
                <p className="text-xs text-(--c-text-muted)">
                    {directory ? 'Select a folder — all images inside will be uploaded' : (accept || 'Any file type')}
                </p>
            </div>

            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    {directory ? (
                        <div
                            className="flex items-center justify-between rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <UploadIcon className="w-4 h-4 text-(--c-text-muted) shrink-0"/>
                                <div className="min-w-0">
                                    <p className="text-sm text-(--c-text) truncate">
                                        {(selectedFiles[0] as File & {
                                            webkitRelativePath?: string
                                        }).webkitRelativePath?.split('/')[0] ?? 'Folder'}
                                    </p>
                                    <p className="text-xs text-(--c-text-muted)">{selectedFiles.length} file(s)
                                        selected</p>
                                </div>
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedFiles([])
                                        onFilesChange?.([])
                                    }}
                                    className="ml-2 p-1 text-(--c-text-muted) hover:text-(--c-accent) transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    ) : (
                        selectedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <UploadIcon className="w-4 h-4 text-(--c-text-muted) shrink-0"/>
                                    <div className="min-w-0">
                                        <p className="text-sm text-(--c-text) truncate">{file.name}</p>
                                        <p className="text-xs text-(--c-text-muted)">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemove(index)
                                        }}
                                        className="ml-2 p-1 text-(--c-text-muted) hover:text-(--c-accent) transition-colors shrink-0"
                                    >
                                        <X className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
