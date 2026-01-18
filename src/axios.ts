import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useCommand, useConfig } from './hooks';

export const api = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Initialize Axios with configuration from the application settings.
 */
export const initAxios = () => {
    const [getConfig] = useConfig()
    const config = getConfig()

    api.defaults.baseURL = config.apiBaseURL || 'https://api.paystack.co';
    api.defaults.timeout = config.timeoutDuration || 3000;
}

/**
 * Log the full request details if we are not in production
 * @param config 
 * @returns 
 */
const logInterceptor = (config: InternalAxiosRequestConfig) => {
    const [getConfig] = useConfig()
    const [command] = useCommand()
    const conf = getConfig()
    const v = command().getVerbosity()

    if (conf.debug || v > 1) {
        console.log('Error Response URL:', axios.getUri(config));

        if (conf.debug || v >= 2) {
            console.log('Request URL:', config.url);
            console.log('Request Method:', config.method);
        }
        if (conf.debug || v == 3) {
            console.log('Request Headers:', config.headers);
            console.log('Request Data:', config.data);
        }
    }
    return config;
};

/**
 * Log only the relevant parts of the response if we are in not in production
 * 
 * @param response 
 * @returns 
 */
const logResponseInterceptor = (response: AxiosResponse) => {
    const [getConfig] = useConfig()
    const [command] = useCommand()
    const conf = getConfig()
    const v = command().getVerbosity()

    if (conf.debug || v > 1) {
        const { data, status, statusText, headers } = response;

        console.log('Error Response URL:', axios.getUri(response.config));

        if (conf.debug || v >= 2) {
            console.log('Response Data:', data);
            console.log('Response Status:', status);
        }
        if (conf.debug || v === 3) {
            console.log('Response Status Text:', statusText);
            console.log('Response Headers:', headers);
        }
    }
    return response;
};

const logResponseErrorInterceptor = (error: AxiosError) => {
    const [getConfig] = useConfig()
    const [command] = useCommand()
    const conf = getConfig()
    const v = command().getVerbosity()

    if (conf.debug || v > 1) {
        if (error.response) {
            const { data, status, headers } = error.response;

            console.log('Error Response URL:', axios.getUri(error.config));

            if (conf.debug || v >= 2) {
                console.log('Error Response Data:', data);
                console.log('Error Response Status:', status);
            }
            if (conf.debug || v === 3) {
                console.log('Error Response Headers:', headers);
            }
        } else {
            console.log('Error Message:', error.message);
        }
    }
    return Promise.reject(error);
};

api.interceptors.request.use(logInterceptor, (error) => Promise.reject(error));
api.interceptors.response.use(logResponseInterceptor, logResponseErrorInterceptor);

export default api;