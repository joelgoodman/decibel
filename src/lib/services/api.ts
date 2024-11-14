import { QueryClient } from '@tanstack/svelte-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

interface User {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  getCurrentUser = async (): Promise<User> => {
    return this.fetch<User>('/users/me');
  };

  updateProfile = async (data: Partial<User>): Promise<User> => {
    return this.fetch<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  login = async (email: string): Promise<{ message: string }> => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    return this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, redirectUri })
    });
  };

  handleAuthCallback = async (code: string): Promise<{ user: User }> => {
    return this.fetch('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  };

  logout = async (): Promise<void> => {
    await this.fetch('/auth/logout', {
      method: 'POST'
    });
  };

  getContent = async (params: {
    query?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return this.fetch(`/content?${searchParams.toString()}`);
  };

  getContentById = async (id: string): Promise<any> => {
    return this.fetch(`/content/${id}`);
  };

  createContent = async (data: any): Promise<any> => {
    return this.fetch('/content', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };

  updateContent = async (id: string, data: any): Promise<any> => {
    return this.fetch(`/content/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  getPublications = async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<any> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return this.fetch(`/publications?${searchParams.toString()}`);
  };

  sendNewsletter = async (options: {
    contentId: string;
    test?: boolean;
    testEmail?: string;
  }): Promise<any> => {
    return this.fetch('/newsletter/send', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  };

  importSubscribers = async (formData: FormData): Promise<any> => {
    return this.fetch('/subscribers/import', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  };
}

export const api = new ApiService();