import {ProductUploadBatchProcessStatus} from "@/types/admin/ProductTypes.ts";
import getServiceEndpoint from "@/utils/HostnameResolver.ts";

export async function uploadProductCsv(file: File): Promise<Response> {
    const formData = new FormData();
    formData.append('file', file);

    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/upload-csv`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
    }

    return response;
}

export async function processProductUploadBatch(batchId: string): Promise<ProductUploadBatchProcessStatus> {
    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/batches/${batchId}/staged/async`, {
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

export async function getProductUploadBatchProcessStatus(batchId: string): Promise<ProductUploadBatchProcessStatus> {
    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/batches/${batchId}/staged/status`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error getting batch status: ${response.statusText}`);
    }

    return response.json();
}

function resolveExportFilename(contentDispositionHeader: string | null): string {
    if (!contentDispositionHeader) return "catalog_export.csv";

    const utf8NameMatch = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8NameMatch?.[1]) {
        return decodeURIComponent(utf8NameMatch[1]);
    }

    const plainNameMatch = contentDispositionHeader.match(/filename="?([^";]+)"?/i);
    if (plainNameMatch?.[1]) {
        return plainNameMatch[1];
    }

    return "catalog_export.csv";
}

export async function exportAllProducts(): Promise<void> {
    const serviceEndpoint = getServiceEndpoint(8080);
    const response = await fetch(`${serviceEndpoint}/api/admin/products/export`, {
        method: "GET",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error exporting products: ${response.statusText}`);
    }

    const blob = await response.blob();
    const filename = resolveExportFilename(response.headers.get("content-disposition"));
    const downloadUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(downloadUrl);
}