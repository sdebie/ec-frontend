import {LoginRequest, LoginResponse, ResetPasswordRequest} from '../types/auth';
import getServiceEndpoint from "../utils/HostnameResolver";

const baseUrl = getServiceEndpoint(8080) || '/api';

const StaffService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    adminLogin: async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        const res = await fetch(`${baseUrl}/api/admin/auth/reset-password`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
    },
};

export default StaffService;
