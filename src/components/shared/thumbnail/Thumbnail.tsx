import {useState} from "react";

export const Thumbnail = ({logoUrl, name}: { logoUrl?: string | null; name: string }) => {

    const [imgError, setImgError] = useState(false);
    const initials = name?.slice(0, 2).toUpperCase() ?? '?';

    if (logoUrl && !imgError) {
        return (
            <img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-9 w-9 rounded-md object-contain bg-gray-50 border border-gray-100"
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div
            className="h-9 w-9 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500 select-none">
            {initials}
        </div>
    );
};

Thumbnail.displayName = 'Thumbnail';
