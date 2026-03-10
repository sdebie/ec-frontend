import React, { useState, useRef } from 'react';
import { Button } from "@/components";
import ImageService from "@/services/ImageService.ts";
import CustomModal from "@/pages/shared/CustomModal.tsx";

const BulkImageUploader = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
            setIsUploadModalOpen(true);
        }
    };

    const triggerFolderSelect = () => {
        setIsPreConfirmOpen(false);
        inputRef.current?.click();
    };

    const startUpload = async () => {
        setIsUploading(true);
        try {
            const response = await ImageService.bulkUploadImages(selectedFiles);
            alert(`Upload Complete! Saved: ${response.uploaded.length}, Skipped: ${response.skipped.length}`);
            setIsUploadModalOpen(false);
            setSelectedFiles([]);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-white">Bulk Image Sync</h3>

            <div className="border-2 border-dashed border-slate-600 p-8 rounded-md text-center">
                <input
                    ref={inputRef}
                    type="file"
                    id="folder-upload"
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                    onChange={handleFolderSelect}
                />
                <Button onClick={() => setIsPreConfirmOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-medium transition">
                    Select Images Folder
                </Button>
                <p className="text-slate-400 text-sm mt-3">Images must be named as [SKU].jpg</p>
            </div>

            {/* Pre-confirmation Modal */}
            <CustomModal
                isOpen={isPreConfirmOpen}
                onClose={() => setIsPreConfirmOpen(false)}
                title="Folder Upload Confirmation"
                footer={
                    <>
                        <Button onClick={() => setIsPreConfirmOpen(false)} className="bg-transparent text-slate-400">Cancel</Button>
                        <Button onClick={triggerFolderSelect} className="bg-blue-600 hover:bg-blue-500">
                            Proceed
                        </Button>
                    </>
                }
            >
                <p className="text-slate-300">You are about to select a folder for bulk image upload. Your browser will ask for permission to access the folder contents. This is a standard security measure.</p>
            </CustomModal>

            {/* Upload Review Modal */}
            <CustomModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="Review Bulk Upload"
                footer={
                    <>
                        <Button onClick={() => setIsUploadModalOpen(false)} className="bg-transparent text-slate-400">Cancel</Button>
                        <Button
                            onClick={startUpload}
                            disabled={isUploading}
                            className="bg-green-600 hover:bg-green-500"
                        >
                            {isUploading ? 'Uploading...' : 'Confirm & Start Upload'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-green-400 font-semibold">{selectedFiles.length} images found in folder.</p>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-3 rounded border border-slate-700 max-h-60 overflow-y-auto">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="truncate">📄 {file.name}</div>
                        ))}
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default BulkImageUploader;