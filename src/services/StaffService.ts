import {LoginRequest, LoginResponse, ResetPasswordRequest} from '../types/auth';
import ApiService from './rest/RestApiService.ts';

const StaffService = {
    login: (data: LoginRequest) => {
        return ApiService.fetchDataWithAxios<LoginResponse, LoginRequest>({
            url: '/admin/auth/login',
            method: 'POST',
            data,
        });
    },

    adminLogin: (data: LoginRequest) => {
        return ApiService.fetchDataWithAxios<LoginResponse, LoginRequest>({
            url: '/admin/auth/login',
            method: 'POST',
            data,
        });
    },

    resetPassword: (data: ResetPasswordRequest) => {
        return ApiService.fetchDataWithAxios<void, ResetPasswordRequest>({
            url: '/admin/auth/reset-password',
            method: 'POST',
            data,
        });
    },
};

export default StaffService;
