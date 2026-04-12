export const formatAttributes = (attributesJson?: string) => {
    if (!attributesJson) return "";

    try {
        const attributes = JSON.parse(attributesJson);

        return Object.entries(attributes)
            .map(([key, value]) => {
                // Optional: prettify key
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                return `${label}: ${value}`;
            })
            .join(" | ");
    } catch (err) {
        console.error("Invalid attributes JSON", err);
        return "";
    }
};