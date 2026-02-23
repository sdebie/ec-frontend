
export type AppConfig = {
	apiPrefix: string
	authenticatedEntryPath: string
	unAuthenticatedEntryPath: string
	locale: string
	country: string
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
	apiPrefix: '/api',
	platformRealm: 'ToSet',
	authenticatedEntryPath: '/dashboard',
	unAuthenticatedEntryPath: '',
	locale: 'en',
	country: 'NG',
	accessTokenPersistStrategy: 'cookies',
	activeNavTranslation: false,
	devMode: true,
	appName: 'To Set',
	appVersion: '0.1',
	nativeBaseHostname: "",
	nativeBaseUrl: ""
}

export default appConfig
