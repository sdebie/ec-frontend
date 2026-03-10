import React, { useState } from 'react';
import { Button } from "@/components";
import { useNavigate } from 'react-router-dom';
import {uploadProductCsv} from "@/services/ProductService.ts";

const ProductBulkUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);

        try {
            const response = await uploadProductCsv(file);
            const result = await response.json();

            // Redirect to the approval/review page with the batch ID
            navigate(`/admin/imports/review/${result.id}`);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Error uploading CSV. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-white">Bulk Product Update</h2>
                    <p className="text-slate-400">Upload a CSV file to update prices, names, and categories in bulk.</p>
                </header>

                {/* Drag & Drop / Selection Area */}
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
                        <div className="text-4xl mb-4">📊</div>
                        <span className="text-lg text-white font-medium">
                            {file ? file.name : 'Click to select or drag CSV file'}
                        </span>
                        <span className="text-slate-500 text-sm mt-2">Maximum 5,000 rows per batch</span>
                    </label>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        <strong>Tip:</strong> Ensure your SKU column matches your current product SKUs.
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="bg-blue-600 hover:bg-blue-500 px-8 py-2 font-bold"
                    >
                        {isUploading ? 'Processing CSV...' : 'Upload & Preview Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductBulkUpload;