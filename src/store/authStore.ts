import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import {LoginResponse} from '@/types/auth'
import cookiesStorage from '@/utils/cookiesStorage'
import {getSessionUserStorageKey} from '@/utils/storefront/tenantStorageKeys'

type Session = {
    signedIn: boolean
}

type AuthState = {
    session: Session
    user: LoginResponse
}

type AuthAction = {
    setSessionSignedIn: (payload: boolean) => void
    setUser: (payload: LoginResponse) => void
    resetAuthState: () => void
}

const getPersistStorage = () => {
    if (appConfig.accessTokenPersistStrategy === 'localStorage') {
        return localStorage
    }

    if (appConfig.accessTokenPersistStrategy === 'sessionStorage') {
        return sessionStorage
    }

    return cookiesStorage
}

const initialState: AuthState = {
    session: {
        signedIn: false,
    },
    user: {
        token: '',
        role: '',
        avatar: '',
        userName: '',
        email: '',
        authority: [],
    },
}

export const useSessionUser = create<AuthState & AuthAction>()(
    persist(
        (set) => ({
            ...initialState,
            setSessionSignedIn: (payload) =>
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn: payload,
                    },
                })),
            setUser: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        ...payload,
                    },
                })),
            resetAuthState: () => set(() => ({...initialState})),
        }),
        { name: getSessionUserStorageKey(), storage: createJSONStorage(() => localStorage) },
    ),
)

export const resetSessionUserStore = () => {
    useSessionUser.getState().resetAuthState()
}

export const useToken = () => {
    const storage = getPersistStorage()

    const setToken = (token: string) => {
        storage.setItem(TOKEN_NAME_IN_STORAGE, token)
    }

    return {
        setToken,
        token: storage.getItem(TOKEN_NAME_IN_STORAGE),
    }
}
