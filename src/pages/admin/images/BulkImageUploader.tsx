import React, { useState, useRef } from 'react';
import { Button } from "@/components";
import ImageServiceRest from "@/services/rest/admin/ImageService.rest.ts";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/shared/dialog/Dialog.tsx";

const BulkImageUploader = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isPreConfirmOpen, setIsPreConfirmOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
        setIsUploading(true);
        try {
            const response = await ImageServiceRest.bulkUploadImages(selectedFiles);
            alert(`Upload Complete! Saved: ${response.uploaded.length}, Skipped: ${response.skipped.length}`);
            setIsUploadDialogOpen(false);
            setSelectedFiles([]);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-admin-panel rounded-lg shadow-xl border border-admin-border">
            <h3 className="text-xl font-bold mb-4 text-admin-text">Bulk Image Sync</h3>

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
                    description="You are about to select a folder for bulk image upload."
                />
                <DialogContent className="space-y-4">
                    <p className="text-admin-text-muted">Your browser will ask for permission to access the folder contents. This is a standard security measure.</p>
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
                    description={`${selectedFiles.length} images found in folder.`}
                />
                <DialogContent className="space-y-4">
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
                        {isUploading ? 'Uploading...' : 'Confirm & Start Upload'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default BulkImageUploader;