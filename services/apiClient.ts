import axios, { AxiosInstance } from 'axios';

// Backend API base URL - adjust for your environment
const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

let client: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: BACKEND_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  return client;
}

export default getApiClient;
