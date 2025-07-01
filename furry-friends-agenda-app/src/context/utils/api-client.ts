const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

async function client<T>(
    endpoint: string,
    method: string,
    body?: any,
    token?: string | null,
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
        credentials: 'include', // Inclui cookies nas requisições
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Se o token expirou, limpa o localStorage e redireciona para login
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error: ApiError = {
                message: errorData.message || 'Ocorreu um erro na requisição',
                status: response.status,
                errors: errorData.errors,
            };
            throw error;
        }

        // Handle cases where response might be empty
        const responseText = await response.text();
        if (!responseText) {
            return {} as T;
        }
        return JSON.parse(responseText);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Ocorreu um erro inesperado');
    }
}

export function get<T>(endpoint: string, token?: string | null): Promise<T> {
    return client<T>(endpoint, 'GET', null, token);
}

export function post<T>(
    endpoint: string,
    body: any,
    token?: string | null,
): Promise<T> {
    return client<T>(endpoint, 'POST', body, token);
}

export function patch<T>(
    endpoint: string,
    body: any,
    token?: string | null,
): Promise<T> {
    return client<T>(endpoint, 'PATCH', body, token);
}

export function del<T>(endpoint: string, token?: string | null): Promise<T> {
    return client<T>(endpoint, 'DELETE', null, token);
} 