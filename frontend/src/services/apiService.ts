import {Capacitor} from '@capacitor/core';

/**
 * Get the correct API base URL based on platform and environment
 */
export function getApiBaseUrl(): string {
    // Check if we have a configured API URL in env
    const configuredUrl = import.meta.env.VITE_API_URL;

    // On native platforms in development
    if (Capacitor.isNativePlatform()) {
        if (configuredUrl) {
            console.log(`[API] Using configured URL for native platform: ${configuredUrl}`);
            return configuredUrl;
        }

        // WARNING: localhost doesn't work on physical iOS devices
        // You need to use your Mac's local IP address (e.g., http://192.168.x.x:8000)
        // Set VITE_API_URL in .env.local with your Mac's IP
        const platform = Capacitor.getPlatform();
        console.warn(`[API] No VITE_API_URL configured for ${platform}. Using fallback which may not work on physical devices.`);

        if (platform === 'ios') {
            // Note: This only works on iOS simulator, not physical devices
            return 'http://localhost:8000';
        } else if (platform === 'android') {
            // Special IP for Android emulator to access host machine
            return 'http://10.0.2.2:8000';
        }

        // Default to production URL for physical devices
        console.log('[API] Falling back to production URL');
        return 'https://parallax-darktech.nl';
    }

    // On web platform
    return configuredUrl || 'http://localhost:8000';
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

