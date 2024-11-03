import { createClient } from '@/lib/api/client'

// Base API client with authentication and error handling
export const apiClient = createClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Type-safe API hooks for common operations
export const api = {
  // Posts
  posts: {
    list: async (params?: any) => 
      apiClient.get('/api/posts', { params }),
    get: async (id: string) => 
      apiClient.get(`/api/posts/${id}`),
    create: async (data: any) => 
      apiClient.post('/api/posts', data),
    update: async (id: string, data: any) => 
      apiClient.put(`/api/posts/${id}`, data),
    delete: async (id: string) => 
      apiClient.delete(`/api/posts/${id}`),
  },

  // Podcasts
  podcasts: {
    list: async (params?: any) => 
      apiClient.get('/api/podcasts', { params }),
    get: async (id: string) => 
      apiClient.get(`/api/podcasts/${id}`),
    create: async (data: any) => 
      apiClient.post('/api/podcasts', data),
    update: async (id: string, data: any) => 
      apiClient.put(`/api/podcasts/${id}`, data),
    delete: async (id: string) => 
      apiClient.delete(`/api/podcasts/${id}`),
  },

  // Authentication
  auth: {
    login: async (data: any) => 
      apiClient.post('/api/auth/login', data),
    logout: async () => 
      apiClient.post('/api/auth/logout'),
    register: async (data: any) => 
      apiClient.post('/api/auth/register', data),
  },

  // Comments
  comments: {
    list: async (params?: any) => 
      apiClient.get('/api/comments', { params }),
    create: async (data: any) => 
      apiClient.post('/api/comments', data),
    delete: async (id: string) => 
      apiClient.delete(`/api/comments/${id}`),
  },

  // Search
  search: async (query: string) => 
    apiClient.get('/api/search', { params: { q: query } }),

  // Newsletter
  newsletter: {
    subscribe: async (email: string) => 
      apiClient.post('/api/newsletter/subscribe', { email }),
    unsubscribe: async (email: string) => 
      apiClient.post('/api/newsletter/unsubscribe', { email }),
  },
}