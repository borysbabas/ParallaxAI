import {Capacitor} from '@capacitor/core';

/**
 * Get the correct API base URL based on platform and environment
 */
export function getApiBaseUrl(): string {
    // On native platforms in development
    if (Capacitor.isNativePlatform()) {
        // Check if we have a configured API URL in env
        const configuredUrl = import.meta.env.VITE_API_URL;
        if (configuredUrl) {
            return configuredUrl;
        }

        // Default to production URL for mobile
        return 'https://parallax-darktech.nl';
    }

    // On web platform
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
}

/**
 * API client configuration
 */
export const apiConfig = {
    baseUrl: getApiBaseUrl(),
    timeout: 30000, // 30 seconds for mobile networks
};

/**
 * Make API request with proper error handling
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${apiConfig.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json().catch(() => ({detail: 'Unknown error'}));
            throw new Error(error.detail || `Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your connection');
            }
            throw error;
        }

        throw new Error('Unknown error occurred');
    }
}

/**
 * Check if API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        await apiRequest('/status', {method: 'GET'});
        return true;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

