import { writable, derived } from 'svelte/store';

interface Session {
  lastActivity: number;
  expiresAt: number;
}

function createSessionStore() {
  const { subscribe, set, update } = writable<Session>({
    lastActivity: Date.now(),
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
  });

  let inactivityTimer: number;
  let expirationTimer: number;
  let logoutCallback: () => void;

  function initialize(onLogout: () => void) {
    logoutCallback = onLogout;
    
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, resetTimers);
      });
    }
  }

  function cleanup() {
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.removeEventListener(event, resetTimers);
      });
    }
    
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (expirationTimer) clearTimeout(expirationTimer);
  }

  function resetTimers() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (expirationTimer) clearTimeout(expirationTimer);

    update(session => ({
      lastActivity: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000)
    }));

    inactivityTimer = setTimeout(() => {
      refreshSession();
    }, 14 * 60 * 1000);

    expirationTimer = setTimeout(() => {
      if (logoutCallback) logoutCallback();
    }, 15 * 60 * 1000);
  }

  async function refreshSession() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        resetTimers();
      } else {
        if (logoutCallback) logoutCallback();
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      if (logoutCallback) logoutCallback();
    }
  }

  return {
    subscribe,
    initialize,
    cleanup,
    resetTimers,
    refreshSession
  };
}

export const session = createSessionStore();

// Derived store for session status
export const sessionStatus = derived(
  [session],
  ([$session]) => {
    const timeUntilExpiry = $session.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) return 'expired';
    if (timeUntilExpiry <= 60000) return 'expiring';
    return 'active';
  }
);