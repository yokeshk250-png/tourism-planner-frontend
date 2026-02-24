import axios, { AxiosInstance } from 'axios';

// Backend API base URL - adjust for your environment
// For Android emulator: 10.0.2.2:8000, iOS simulator: localhost:8000
const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

let client: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: BACKEND_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[API Error]', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  return client;
}
