import { auth } from '../stores/auth';
import { api } from './api';

export async function login(email: string): Promise<void> {
  try {
    auth.setLoading(true);
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, redirectUri })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
  } finally {
    auth.setLoading(false);
  }
}

export async function handleAuthCallback(code: string): Promise<void> {
  try {
    auth.setLoading(true);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const { user } = await response.json();
    auth.setUser(user);
  } finally {
    auth.setLoading(false);
  }
}