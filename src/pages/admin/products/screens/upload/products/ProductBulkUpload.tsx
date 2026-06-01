import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/shared/dialog/Dialog.tsx";
import {uploadProductCsv} from "@/services/rest/admin/ProductUploadService.rest.ts";

const ProductBulkUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(true);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleClose = () => {
        setIsDialogOpen(false);
        navigate(-1);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);

        try {
            await uploadProductCsv(file);

            setIsDialogOpen(false);
            navigate("/admin/imports/products/list");
        } catch (error) {
            console.error('Upload failed', error);
            alert('Error uploading CSV. Check console for details.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="lg">
            <DialogHeader
                title="Bulk Product Update"
                description="Upload a CSV file to update prices, names, and categories in bulk."
            />
            <DialogContent className="space-y-6">
                <div className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                    file ? 'border-green-500 bg-green-500/5' : 'border-slate-600 hover:border-blue-500'
                }`}>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="text-4xl mb-4">CSV</div>
                        <span className="text-lg font-medium">
                            {file ? file.name : 'Click to select or drag CSV file'}
                        </span>
                        <span className="text-sm mt-2 text-slate-500">Maximum 5,000 rows per batch</span>
                    </label>
                </div>

                <div className="text-xs text-slate-500">
                    <strong>Tip:</strong> Ensure your SKU column matches your current product SKUs.
                </div>
            </DialogContent>
            <DialogFooter>
                <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="bg-blue-600 hover:bg-blue-500 px-8 py-2 font-bold"
                >
                    {isUploading ? 'Processing CSV...' : 'Upload & Preview Changes'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ProductBulkUpload;