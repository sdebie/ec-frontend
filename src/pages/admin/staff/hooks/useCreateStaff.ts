 import {useState} from "react";
import type {Staff} from "@/types/admin/StaffTypes.ts";
import {apiCreateStaff} from "@/services/graphql/admin/staff/StaffService.graphql.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't create the staff user right now. Please try again.";

type CreateStaffInput = Pick<Staff, "email" | "role" | "active"> & {
    fullName?: string | null;
    temporaryPassword: string;
};

type UseCreateStaffOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useCreateStaff(options?: UseCreateStaffOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const createStaff = async (staffDto: CreateStaffInput) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiCreateStaff(staffDto);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to create staff:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createStaff,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

