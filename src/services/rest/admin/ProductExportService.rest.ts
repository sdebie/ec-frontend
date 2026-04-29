import getServiceEndpoint from "@/utils/HostnameResolver.ts";

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

async function exportProductsCsv(path: string, errorMessage: string): Promise<void> {
	const serviceEndpoint = getServiceEndpoint(8080);
	const response = await fetch(`${serviceEndpoint}${path}`, {
		method: "GET",
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || `${errorMessage}: ${response.statusText}`);
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

export async function exportAllProducts(): Promise<void> {
	return exportProductsCsv("/api/admin/products/full_export", "Error exporting products");
}

export async function exportProductsList(): Promise<void> {
	return exportProductsCsv("/api/admin/products/list_export", "Error exporting product list");
}

export async function exportProductsPrice(): Promise<void> {
	return exportProductsCsv("/api/admin/products/price_export", "Error exporting product prices");
}



