import React, { useEffect, useRef, useState } from 'react';

import { Button, Select } from "@/components";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/shared/dialog/Dialog.tsx";
import ImageServiceRest from "@/services/rest/admin/ImageService.rest.ts";

const UPLOAD_BATCH_SIZE = 100;

interface UploadProgressState {
    currentBatch: number;
    totalBatches: number;
}

const BulkImageUploader = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [destinationDirectories, setDestinationDirectories] = useState<string[]>([]);
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [isLoadingDirectories, setIsLoadingDirectories] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(null);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isPreConfirmOpen, setIsPreConfirmOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadDirectories = async () => {
            setIsLoadingDirectories(true);
            try {
                const directories = await ImageServiceRest.fetchImageDirectories();
                setDestinationDirectories(directories);
            } catch (error) {
                console.error("Failed to fetch image destination directories", error);
                setDestinationDirectories([]);
            } finally {
                setIsLoadingDirectories(false);
            }
        };

        loadDirectories();
    }, []);

    const destinationOptions = [
        { value: '', label: 'Storage root' },
        ...destinationDirectories.map((directory) => ({
            value: directory,
            label: directory,
        })),
    ];

    const selectedDirectoryLabel = selectedDirectory || 'Storage root';

    const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const imageFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp)$/i)
        );

        setSelectedFiles(imageFiles);
        if (imageFiles.length > 0) {
            setIsUploadDialogOpen(true);
        }
    };

    const triggerFolderSelect = () => {
        setIsPreConfirmOpen(false);
        inputRef.current?.click();
    };

    const startUpload = async () => {
        if (selectedFiles.length === 0) {
            return;
        }

        setIsUploading(true);
        const totalBatches = Math.ceil(selectedFiles.length / UPLOAD_BATCH_SIZE);
        let uploadedTotal = 0;
        let skippedTotal = 0;

        try {
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const start = batchIndex * UPLOAD_BATCH_SIZE;
                const end = start + UPLOAD_BATCH_SIZE;
                const filesBatch = selectedFiles.slice(start, end);

                setUploadProgress({
                    currentBatch: batchIndex + 1,
                    totalBatches,
                });

                const response = await ImageServiceRest.bulkUploadImages(filesBatch, {
                    destinationDirectory: selectedDirectory,
                });

                uploadedTotal += response.uploaded;
                skippedTotal += response.skipped;
            }

            alert(`Upload Complete! Destination: ${selectedDirectoryLabel}. Saved: ${uploadedTotal}, Skipped: ${skippedTotal}`);
            setIsUploadDialogOpen(false);
            setSelectedFiles([]);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    return (
        <div className="p-6 bg-admin-panel rounded-lg shadow-xl border border-admin-border">
            <h3 className="text-xl font-bold mb-4 text-admin-text">Bulk Image Sync</h3>

            <div className="mb-4">
                <Select
                    label="Destination directory"
                    options={destinationOptions}
                    value={selectedDirectory}
                    onChange={setSelectedDirectory}
                    disabled={isLoadingDirectories || isUploading}
                />
                <p className="text-admin-text-muted text-xs mt-2">
                    {isLoadingDirectories
                        ? 'Loading directories from storage.path...'
                        : 'Choose where the uploaded images should be stored under IMAGE_STORAGE_PATH.'}
                </p>
                {!isLoadingDirectories && destinationDirectories.length === 0 && (
                    <p className="text-admin-text-muted text-xs mt-2">
                        No subdirectories were found yet. Selecting Storage root will upload directly into the configured image storage path.
                    </p>
                )}
            </div>

            <div className="border-2 border-dashed border-admin-border p-8 rounded-md text-center">
                <input
                    ref={inputRef}
                    type="file"
                    id="folder-upload"
                    multiple
                    className="hidden"
                    onChange={handleFolderSelect}
                    {...({ webkitdirectory: '', directory: '' } as any)}
                />
                <Button variant="solid" onClick={() => setIsPreConfirmOpen(true)}>
                    Select Images Folder
                </Button>
                <p className="text-admin-text-muted text-sm mt-3">Images must be named as [SKU].jpg</p>
            </div>

            {/* Pre-confirmation Dialog */}
            <Dialog open={isPreConfirmOpen} onClose={() => setIsPreConfirmOpen(false)} size="md">
                <DialogHeader
                    title="Folder Upload Confirmation"
                    description={`You are about to select a folder for bulk image upload into ${selectedDirectoryLabel}.`}
                />
                <DialogContent className="space-y-4">
                    <p className="text-admin-text-muted">Your browser will ask for permission to access the folder contents. This is a standard security measure.</p>
                    <div className="rounded border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text-muted">
                        Destination: <span className="font-medium text-admin-text">{selectedDirectoryLabel}</span>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsPreConfirmOpen(false)}>Cancel</Button>
                    <Button variant="solid" onClick={triggerFolderSelect}>
                        Proceed
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Upload Review Dialog */}
            <Dialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} size="md">
                <DialogHeader
                    title="Review Bulk Upload"
                    description={`${selectedFiles.length} images found in folder for ${selectedDirectoryLabel}.`}
                />
                <DialogContent className="space-y-4">
                    <div className="rounded border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text-muted">
                        Destination: <span className="font-medium text-admin-text">{selectedDirectoryLabel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-admin-bg p-3 rounded border border-admin-border max-h-60 overflow-y-auto">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="truncate text-admin-text-muted">📄 {file.name}</div>
                        ))}
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="solid"
                        onClick={startUpload}
                        disabled={isUploading}
                        loading={isUploading}
                    >
                        {isUploading
                            ? `Uploading batch ${uploadProgress?.currentBatch ?? 1} of ${uploadProgress?.totalBatches ?? 1}...`
                            : 'Confirm & Start Upload'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default BulkImageUploader;