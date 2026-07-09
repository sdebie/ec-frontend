export interface CustomerLoginRequest {
  email: string
  password: string
}

export interface CustomerRegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface CustomerGoogleLoginRequest {
  idToken: string
}

export interface CustomerLoginResponse {
  token: string
  email: string
  firstName: string
  lastName: string
  shopperType: 'GUEST' | 'RETAILER' | 'WHOLESALER'
  status: 'PENDING' | 'ACTIVE' | 'DISABLED'
}

export interface StorefrontMeResponse {
  email: string
  shopperType: 'GUEST' | 'RETAILER' | 'WHOLESALER'
}
