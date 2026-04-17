import {ProductUploadBatchProcessStatus} from "@/types/admin/ProductTypes.ts";
import getServiceEndpoint from "@/utils/HostnameResolver.ts";

export async function uploadProductPriceCsv(file: File): Promise<Response> {
    const formData = new FormData();
    formData.append('file', file);

    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/price/upload-csv`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
    }

    return response;
}

export async function processProductPriceUploadBatch(batchId: string): Promise<ProductUploadBatchProcessStatus> {
    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/price/batches/${batchId}/staged/async`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error processing batch: ${response.statusText}`);
    }

    return response.json();
}

export async function getProductPriceUploadBatchProcessStatus(batchId: string): Promise<ProductUploadBatchProcessStatus> {
    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/price/batches/${batchId}/staged/status`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error getting batch status: ${response.statusText}`);
    }

    return response.json();
}

