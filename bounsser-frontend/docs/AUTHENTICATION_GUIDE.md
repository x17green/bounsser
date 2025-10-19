# 🔐 **Complete Twitter OAuth Integration Guide: Backend to Next.js Frontend**

## 📊 **Backend Authentication Analysis Summary**

### **✅ What's Already Implemented**

Your Bouncer backend has a **robust and production-ready** Twitter OAuth 2.0 implementation:

#### **🔑 Authentication Flow**
- **OAuth 2.0 with PKCE** (Proof Key for Code Exchange) - Modern security standard
- **JWT-based authentication** with access and refresh tokens
- **Rate limiting** protection against abuse
- **Session management** with Redis backing
- **Encrypted token storage** in database

#### **🛠️ Available Endpoints**

| Endpoint | Method | Purpose | Response |
|----------|---------|---------|----------|
| `/api/v1/auth/twitter` | GET | Initiate OAuth | `authUrl`, `codeVerifier`, `state` |
| `/api/v1/auth/twitter/callback` | POST | Handle OAuth callback | JWT tokens + user data |
| `/api/v1/auth/refresh` | POST | Refresh JWT tokens | New JWT tokens |
| `/api/v1/auth/logout` | POST | Logout user | Success confirmation |
| `/api/v1/auth/me` | GET | Get current user | User profile data |

#### **🔒 Security Features**
- **CSRF Protection** with state parameter
- **Rate limiting** (10 requests per 15 min for auth)
- **Encrypted token storage** 
- **CORS configuration**
- **JWT with expiration**

---

## 🚀 **Frontend Integration Guide**

### **Phase 1: Setup Authentication Context**

#### **1. Install Required Dependencies**

```bash
# In your Next.js frontend directory
npm install axios js-cookie @types/js-cookie
```

#### **2. Create Authentication Context**

Create `lib/auth/AuthContext.tsx`:

```typescript
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  xId: string;
  username: string;
  role?: string;
  profile?: {
    name: string;
    profile_image_url?: string;
    verified: boolean;
    followers_count?: number;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('bouncer_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token invalid, clear it
        Cookies.remove('bouncer_access_token');
        Cookies.remove('bouncer_refresh_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      // Step 1: Get Twitter OAuth URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/twitter`);
      const data = await response.json();
      
      if (data.success) {
        // Store code verifier for later use
        sessionStorage.setItem('oauth_code_verifier', data.data.codeVerifier);
        sessionStorage.setItem('oauth_state', data.data.state);
        
        // Redirect to Twitter
        window.location.href = data.data.authUrl;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = Cookies.get('bouncer_access_token');
      if (token) {
        // Call backend logout
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless
      setUser(null);
      Cookies.remove('bouncer_access_token');
      Cookies.remove('bouncer_refresh_token');
      sessionStorage.clear();
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = Cookies.get('bouncer_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update cookies
        Cookies.set('bouncer_access_token', data.data.accessToken, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        if (data.data.refreshToken) {
          Cookies.set('bouncer_refresh_token', data.data.refreshToken, { 
            expires: 30, // 30 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }

        await checkAuth();
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### **Phase 2: OAuth Callback Handler**

#### **3. Create OAuth Callback Page**

Create `app/auth/callback/page.tsx`:

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get stored verifier and state
        const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
        const storedState = sessionStorage.getItem('oauth_state');

        if (!codeVerifier) {
          throw new Error('Missing code verifier - please restart login');
        }

        // Verify state matches (CSRF protection)
        if (state && storedState && state !== storedState) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        // Exchange code for tokens
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/twitter/callback?code=${code}&state=${state || ''}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              codeVerifier,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          // Store tokens securely
          Cookies.set('bouncer_access_token', data.data.accessToken, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          
          Cookies.set('bouncer_refresh_token', data.data.refreshToken, {
            expires: 30, // 30 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          // Clear temporary storage
          sessionStorage.removeItem('oauth_code_verifier');
          sessionStorage.removeItem('oauth_state');

          setStatus('success');
          
          // Redirect to dashboard or intended page
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
            <p className="text-gray-600">Please wait while we complete your login.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
            <p className="text-gray-600">You're now logged in. Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### **Phase 3: Authentication Components**

#### **4. Create Login Component**

Create `components/auth/LoginButton.tsx`:

```typescript
'use client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useState } from 'react';

export default function LoginButton() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('Login error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center space-x-2 bg-[#1DA1F2] text-white px-6 py-3 rounded-lg hover:bg-[#1a91da] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
      </svg>
      {isLoading ? (
        <span>Connecting...</span>
      ) : (
        <span>Login with Twitter</span>
      )}
    </button>
  );
}
```

#### **5. Create Protected Route Component**

Create `components/auth/ProtectedRoute.tsx`:

```typescript
'use client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  // Check role if required
  if (requiredRole && (!user?.role || user.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### **Phase 4: API Client with Authentication**

#### **6. Create Authenticated API Client**

Create `lib/api/client.ts`:

```typescript
import Cookies from 'js-cookie';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = Cookies.get('bouncer_access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && token) {
        // Try to refresh token
        const refreshToken = Cookies.get('bouncer_refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              
              // Update tokens
              Cookies.set('bouncer_access_token', refreshData.data.accessToken);
              if (refreshData.data.refreshToken) {
                Cookies.set('bouncer_refresh_token', refreshData.data.refreshToken);
              }
              
              // Retry original request
              return this.request(endpoint, options);
            }
          } catch (error) {
            // Refresh failed, redirect to login
            Cookies.remove('bouncer_access_token');
            Cookies.remove('bouncer_refresh_token');
            window.location.href = '/login';
          }
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### **Phase 5: Environment Configuration**

#### **7. Configure Environment Variables**

Create or update `.env.local` in your Next.js project:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

#### **8. Update Next.js Configuration**

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pbs.twimg.com'], // For Twitter profile images
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### **Phase 6: Usage Examples**

#### **9. Example Dashboard Page**

Create `app/dashboard/page.tsx`:

```typescript
'use client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface UserStats {
  eventsCount: number;
  reportsCount: number;
  subscriptionStatus: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get<UserStats>('/api/v1/users/stats');
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Bouncer Dashboard</h1>
              <div className="flex items-center space-x-4">
                {user?.profile?.profile_image_url && (
                  <img
                    src={user.profile.profile_image_url}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">@{user?.username}</span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Stats Cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">E</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Events Detected
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats?.eventsCount || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">R</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Reports Filed
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats?.reportsCount || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">S</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Subscription
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats?.subscriptionStatus || 'Free'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🔧 **Implementation Steps**

### **Step-by-Step Integration**

1. **Install dependencies** in your Next.js project
2. **Copy the provided code** into your project structure
3. **Update environment variables** 
4. **Wrap your app** with `AuthProvider` in `layout.tsx`
5. **Test the OAuth flow**:
   - Click login button
   - Redirect to Twitter
   - Handle callback
   - Access protected routes

### **Required Backend Configuration**

Make sure your backend has these environment variables:

```bash
# Your current backend should have these
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_OAUTH_CALLBACK_URL=http://localhost:3001/auth/callback
JWT_SECRET=your_jwt_secret_32_chars_min
JWT_REFRESH_SECRET=your_refresh_secret_32_chars_min
```

---

## 🎯 **Key Benefits of This Implementation**

✅ **Security-First**: PKCE OAuth 2.0, CSRF protection, encrypted tokens  
✅ **Production-Ready**: Automatic token refresh, error handling, rate limiting  
✅ **Developer-Friendly**: TypeScript, React hooks, clear separation of concerns  
✅ **Scalable**: Context-based state management, reusable components  
✅ **Modern**: Next.js 13+ app router, server-side rendering support  

This implementation provides a **complete, production-ready authentication system** that seamlessly integrates your robust backend with a modern Next.js frontend! 🚀