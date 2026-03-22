import {useState} from "react";
import {Brand} from "@/types/admin/brand.types.ts";
import {apiUpdateBrand} from "@/services/graphql/admin/brand/brand.service.ts";
import {ClientError} from "graphql-request";

const FRIENDLY_ERROR_MSG = "We couldn't save your changes right now. Please try again.";

type UseEditBrandOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

function extractTechnicalDetails(error: unknown): string {
    if (error instanceof ClientError) {
        const gqlErrors = error.response?.errors;
        if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
            return gqlErrors.map((e: { message?: string }) => e.message ?? String(e)).join("\n");
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
}

export default function useEditBrand(options?: UseEditBrandOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const updateBrand = async (brand: Brand) => {
        const {id, ...brandDto} = brand;
        if (!id) {
            setErrorMsg("Brand id is required to update.");
            setTechnicalDetails("");
            return;
        }
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiUpdateBrand(id, brandDto);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to update brand:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateBrand,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

