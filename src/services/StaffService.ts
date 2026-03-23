import ApiService from './RestApiService';
import { LoginRequest, LoginResponse } from '../types/auth';

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
};

export default StaffService;
