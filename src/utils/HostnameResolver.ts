
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

	if (isWeb) {
		const { protocol, hostname } = window.location;
		const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname);

		// In local development, explicitly target the backend devPort on same host
		if (AppConfig.devMode && isLocal) {
			console.log("HOST:: DEV Endpoint :" + `${protocol}//${hostname}:${devPort}`);
			return `${protocol}//${hostname}:${devPort}`;
		}

		console.log("HOST:: Endpoint :" + `${protocol}//${hostname}`);
		// In production or non-local hosts, assume same-origin without forcing a port
		return `${protocol}//${hostname}`;
	} else {
		// Native or non-web: allow configurable base URL; don't mutate port for HTTPS
		if (AppConfig.nativeBaseUrl) {
			return AppConfig.nativeBaseUrl;
		}
		if (AppConfig.nativeBaseHostname) {
			return `http://${AppConfig.nativeBaseHostname}:${devPort}`;
		}
		return '';
	}
}

export default getServiceEndpoint;
