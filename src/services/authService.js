/**
 * authService.js — SmartMaze Backend Authentication Service (M13)
 * Integrates with Flask REST API & MySQL Database for real user authentication,
 * hashed password verification, and HTTP-only session cookie management.
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
const LOCAL_SESSION_KEY = 'smartmaze_auth_session_v1';

class AuthService {
  constructor() {
    this.session = this.loadLocalSession();
  }

  loadLocalSession() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { isAuthenticated: false, user: null };
    }
    try {
      const raw = localStorage.getItem(LOCAL_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.isAuthenticated && parsed.user) {
          return { isAuthenticated: true, user: parsed.user };
        }
      }
    } catch (err) {
      console.warn('Failed to load local auth session fallback:', err);
    }
    return { isAuthenticated: false, user: null };
  }

  saveLocalSession(user) {
    const sessionState = { isAuthenticated: true, user, loginTimestamp: new Date().toISOString() };
    this.session = sessionState;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionState));
      } catch (err) {
        console.warn('Failed to cache session locally:', err);
      }
    }
    return sessionState;
  }

  clearLocalSession() {
    this.session = { isAuthenticated: false, user: null };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      } catch (err) {
        console.warn('Failed to clear local session cache:', err);
      }
    }
  }

  getSession() {
    return this.session;
  }

  isAuthenticated() {
    return this.session.isAuthenticated;
  }

  getUser() {
    return this.session.user;
  }

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Restore active server session from Flask session cookie
   */
  async checkSession() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.user) {
          const user = json.data.user;
          this.saveLocalSession(user);
          return { isAuthenticated: true, user };
        }
      } else if (res.status === 401) {
        this.clearLocalSession();
        return { isAuthenticated: false, user: null };
      }
    } catch (err) {
      console.warn('Backend server unavailable for session check. Using cached state:', err);
    }

    // If server session check fails (network error/server offline), return local session state
    return this.session;
  }

  /**
   * Authenticate user via Flask REST API
   */
  async login(usernameOrEmail, password) {
    const identifier = String(usernameOrEmail || '').trim();
    const pwd = String(password || '').trim();

    if (!identifier) {
      return { success: false, error: 'Username or Email is required.' };
    }
    if (!pwd) {
      return { success: false, error: 'Password is required.' };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password: pwd }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data && json.data.user) {
        const user = json.data.user;
        this.saveLocalSession(user);
        return { success: true, user };
      } else {
        return { success: false, error: json.message || 'Invalid credentials.' };
      }
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, error: 'Unable to connect to SmartMaze server. Please check backend status.' };
    }
  }

  /**
   * Register a new user via Flask REST API
   */
  async register(username, email, password, confirmPassword) {
    const uName = String(username || '').trim();
    const uEmail = String(email || '').trim();
    const pwd = String(password || '').trim();
    const cPwd = String(confirmPassword || '').trim();

    if (!uName) return { success: false, error: 'Username is required.' };
    if (uName.length < 3) return { success: false, error: 'Username must be at least 3 characters long.' };
    if (!uEmail) return { success: false, error: 'Email address is required.' };
    if (!this.isValidEmail(uEmail)) return { success: false, error: 'Please enter a valid email address.' };
    if (!pwd) return { success: false, error: 'Password is required.' };
    if (pwd.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };
    if (pwd !== cPwd) return { success: false, error: 'Passwords do not match. Please re-enter.' };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: uName, email: uEmail, password: pwd }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data && json.data.user) {
        const user = json.data.user;
        this.saveLocalSession(user);
        return { success: true, user };
      } else {
        return { success: false, error: json.message || 'Registration failed.' };
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      return { success: false, error: 'Unable to connect to SmartMaze server. Please check backend status.' };
    }
  }

  /**
   * Log out active session via Flask REST API
   */
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Backend logout request error:', err);
    }
    this.clearLocalSession();
    return { success: true };
  }
}

export const authService = new AuthService();
export default authService;
