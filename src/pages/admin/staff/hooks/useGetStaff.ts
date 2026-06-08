import {useEffect, useState} from "react";
import {apiGetStaff} from "@/services/graphql/admin/staff/StaffService.graphql.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";
import type {Staff} from "@/types/admin/StaffTypes.ts";

const FRIENDLY_ERROR_MSG = "We couldn't load the staff user. Please try again.";

export default function useGetStaff(id?: string, enabled = true) {
    const [staff, setStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    useEffect(() => {
        if (!id || !enabled) return;

        let isActive = true;

        const fetchStaff = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");
                setTechnicalDetails("");
                const data = await apiGetStaff(id);
                if (isActive) setStaff(data);
            } catch (error) {
                console.error("Failed to fetch staff:", error);
                if (isActive) {
                    setErrorMsg(FRIENDLY_ERROR_MSG);
                    setTechnicalDetails(extractTechnicalDetails(error));
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void fetchStaff();

        return () => {
            isActive = false;
        };
    }, [id, enabled]);

    return {staff, isLoading, errorMsg, technicalDetails};
}

