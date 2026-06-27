const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: string;
  bodyData?: unknown;
  headers?: HeadersInit;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;


  const headers = new Headers(options.headers as HeadersInit | undefined);
  headers.set('Content-Type', 'application/json');


  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rentease_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
  };

  if (options.bodyData !== undefined) {
    config.body = JSON.stringify(options.bodyData);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data as T;
  } catch (error) {
    console.error(`[API Error] url: ${url}`, error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, bodyData: unknown) =>
    request<T>(endpoint, { method: 'POST', bodyData }),

  put: <T>(endpoint: string, bodyData: unknown) =>
    request<T>(endpoint, { method: 'PUT', bodyData }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
