import getServiceEndpoint from '@/utils/HostnameResolver.ts';

const serviceEndpoint = getServiceEndpoint(8080);
const countriesEndpoint = `${serviceEndpoint}/api/countries`;

type RequestOptions = {
    signal?: AbortSignal;
};

export async function fetchCountryListResponse(options: RequestOptions = {}): Promise<Response> {
    return fetch(`${countriesEndpoint}?limit=100&pretty=`, {
        signal: options.signal,
    });
}

export async function fetchCountryInfoResponse(query: string, options: RequestOptions = {}): Promise<Response> {
    return fetch(`${countriesEndpoint}?q=${encodeURIComponent(query)}`, {
        signal: options.signal,
    });
}


