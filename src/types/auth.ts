export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  resetPassword: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  confirmPassword: string;
}
