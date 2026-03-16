import appConfig from "@/configs/app.config";
import { REQUEST_HEADER_AUTH_KEY, TOKEN_NAME_IN_STORAGE, TOKEN_TYPE } from "@/constants/api.constant";
import { useSessionUser, useToken } from "@/store/authStore";
import cookiesStorage from "@/utils/cookiesStorage";

export type AuthTokenProvider = {
  getAccessToken: () => Promise<string | null> | string | null;
  refreshAccessToken?: () => Promise<string | null>;
};

export type RequestHeaderProvider = () => Promise<Record<string, string>> | Record<string, string>;

function getStorageToken(): string | null {
  const strategy = appConfig.accessTokenPersistStrategy;

  if (strategy === "localStorage" && typeof window !== "undefined") {
    return window.localStorage.getItem(TOKEN_NAME_IN_STORAGE);
  }

  if (strategy === "sessionStorage" && typeof window !== "undefined") {
    return window.sessionStorage.getItem(TOKEN_NAME_IN_STORAGE);
  }

  const value = cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE);
  return typeof value === "string" ? value : null;
}

const defaultTokenProvider: AuthTokenProvider = {
  getAccessToken: () => getStorageToken(),
};

let activeTokenProvider: AuthTokenProvider = defaultTokenProvider;

export function setGraphQLTokenProvider(provider: AuthTokenProvider): void {
  activeTokenProvider = provider;
}

export function resetGraphQLTokenProvider(): void {
  activeTokenProvider = defaultTokenProvider;
}

export function getGraphQLTokenProvider(): AuthTokenProvider {
  return activeTokenProvider;
}

export function createAuthHeaderProvider(provider: AuthTokenProvider = getGraphQLTokenProvider()): RequestHeaderProvider {
  return async (): Promise<Record<string, string>> => {
    const token = await provider.getAccessToken();

    if (!token) {
      return {} as Record<string, string>;
    }

    return {
      [REQUEST_HEADER_AUTH_KEY]: `${TOKEN_TYPE}${token}`,
    };
  };
}

export function clearAuthSession(): void {
  const { setToken } = useToken();
  setToken("");
  useSessionUser.getState().setUser({ token: "", username: "", role: "" });
  useSessionUser.getState().setSessionSignedIn(false);
}


