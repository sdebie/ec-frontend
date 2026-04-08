import {useState} from "react";
import type {Staff} from "@/types/admin/StaffTypes.ts";
import {apiUpdateStaff} from "@/services/graphql/admin/staff/StaffService.graphql.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't save your changes right now. Please try again.";

type UseUpdateStaffOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

type UpdateStaffPayload = Pick<Staff, "id" | "email" | "role" | "active"> & {
    resetPassword?: boolean;
    fullName?: string | null;
};

export default function useUpdateStaff(options?: UseUpdateStaffOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const updateStaff = async (staff: UpdateStaffPayload) => {
        const {id, ...staffDto} = staff;

        if (!id) {
            setErrorMsg("Staff id is required to update.");
            setTechnicalDetails("");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiUpdateStaff(id, staffDto);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to update staff:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateStaff,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

