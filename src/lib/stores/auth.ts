import { writable, derived } from 'svelte/store';
import { navigate } from 'svelte-routing';
import { api, queryClient } from '../services/api';
import { session } from './session';

interface User {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Initialize session management
  session.initialize(() => {
    logout();
  });

  async function initialize() {
    update(state => ({ ...state, isLoading: true }));
    
    try {
      const user = await api.getCurrentUser();
      update(state => ({
        ...state,
        user,
        isAuthenticated: !!user,
        error: null
      }));
      
      if (user) {
        session.resetTimers();
        await queryClient.prefetchQuery({
          queryKey: ['publications'],
          queryFn: () => api.getPublications()
        });
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('401')) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Auth initialization failed'
        }));
      }
    } finally {
      update(state => ({ ...state, isLoading: false }));
    }
  }

  async function login(email: string) {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));
      await api.login(email);
      return true;
    } catch (error) {
      update(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      return false;
    } finally {
      update(state => ({ ...state, isLoading: false }));
    }
  }

  async function handleCallback(code: string) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const user = await api.handleAuthCallback(code);
      update(state => ({
        ...state,
        user,
        isAuthenticated: true
      }));

      session.resetTimers();
      await queryClient.prefetchQuery({
        queryKey: ['publications'],
        queryFn: () => api.getPublications()
      });

      navigate('/dashboard');
    } catch (error) {
      update(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }));
      throw error;
    } finally {
      update(state => ({ ...state, isLoading: false }));
    }
  }

  async function logout() {
    try {
      await api.logout();
      queryClient.clear();
      session.cleanup();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return {
    subscribe,
    initialize,
    login,
    handleCallback,
    logout
  };
}

export const auth = createAuthStore();

// Derived store for checking specific permissions
export function hasPermission(permission: string) {
  return derived(auth, ($auth) => {
    if (!$auth.user?.roles) return false;
    return $auth.user.roles.includes('owner') || 
           $auth.user.roles.includes(permission);
  });
}