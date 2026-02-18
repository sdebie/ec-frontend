
import AppConfig from "../configs/app.config.js";

export function getHostname() {
	const isWeb = typeof window !== 'undefined' && window.location;
	if (isWeb) {
		return window.location.hostname;
	} else {
		return AppConfig.nativeBaseHostname;
	}
}

export function getServiceEndpoint(devPort: number) {
	const isWeb = typeof window !== 'undefined' && window.location;

	const port = AppConfig.devMode ? ':' + (window.location.protocol === 'https:' ? devPort + 1000 : devPort) : '';

	if (isWeb) {
		return window.location.protocol + '//' + window.location.hostname + port;
	} else {
		return AppConfig.nativeBaseUrl + port;
	}
}

export default getServiceEndpoint;
