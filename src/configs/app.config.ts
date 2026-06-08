
const apiBaseUrl = ((import.meta.env as unknown as Record<string, string | undefined>).VITE_API_BASE_URL)?.trim() || '/api'

export type AppConfig = {
	apiPrefix: string
	authenticatedEntryPath: string
	unAuthenticatedEntryPath: string
	accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
	activeNavTranslation: boolean
	platformRealm: string
	devMode: boolean,
	nativeBaseHostname: string
	nativeBaseUrl: string,
	appName: string,
	appVersion: string,
}

const appConfig: AppConfig = {
	apiPrefix: apiBaseUrl,
	platformRealm: 'ToSet',
	authenticatedEntryPath: '/dashboard',
	unAuthenticatedEntryPath: '',
	accessTokenPersistStrategy: 'cookies',
	activeNavTranslation: false,
	devMode: true,
	appName: 'To Set',
	appVersion: '0.1',
	nativeBaseHostname: "",
	nativeBaseUrl: ""
}

export default appConfig
