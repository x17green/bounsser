"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/services/api";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have stored auth data
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("bouncer_access_token")
          : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend /auth/me endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1"}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data as User);
          apiService.setToken(token); // Ensure API service has the token
        }
      } else {
        // Token invalid, clear it
        if (typeof window !== "undefined") {
          localStorage.removeItem("bouncer_access_token");
          localStorage.removeItem("bouncer_refresh_token");
        }
        apiService.clearToken();
      }
    } catch (err) {
      console.error("[Bouncer] Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateTwitterLogin = async (state?: string, redirect?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert relative path to full URL if needed
      let fullRedirectUrl = redirect;
      if (redirect && !redirect.startsWith("http")) {
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        fullRedirectUrl = `${baseUrl}${redirect.startsWith("/") ? redirect : "/" + redirect}`;
      }

      const response = await apiService.initiateTwitterAuth(
        state,
        fullRedirectUrl,
      );
      if (response.success && response.data) {
        const {
          authUrl,
          codeVerifier,
          state: returnedState,
        } = response.data as any;

        // Store code verifier and state for callback - CRITICAL for OAuth flow
        if (typeof window !== "undefined") {
          sessionStorage.setItem("oauth_code_verifier", codeVerifier);
          sessionStorage.setItem("oauth_state", returnedState || state || "");
          // Also store redirect URL if provided
          if (fullRedirectUrl) {
            sessionStorage.setItem("oauth_redirect", fullRedirectUrl);
          }
        }

        // Redirect to Twitter
        window.location.href = authUrl;
        return { success: true };
      } else {
        setError(response.error || "Failed to initiate Twitter login");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Twitter login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterCallback = async (code: string, state?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Retrieve stored OAuth data
      const codeVerifier =
        typeof window !== "undefined"
          ? sessionStorage.getItem("oauth_code_verifier")
          : null;
      const storedState =
        typeof window !== "undefined"
          ? sessionStorage.getItem("oauth_state")
          : null;
      const storedRedirect =
        typeof window !== "undefined"
          ? sessionStorage.getItem("oauth_redirect")
          : null;

      if (!codeVerifier) {
        throw new Error("Missing code verifier - please restart login process");
      }

      // Verify state matches (CSRF protection)
      if (state && storedState && state !== storedState) {
        throw new Error("Invalid state parameter - possible CSRF attack");
      }

      // Call backend with all required parameters
      const response = await apiService.handleTwitterCallback(
        code,
        codeVerifier,
        state,
      );

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data as any;

        // Store tokens securely
        if (typeof window !== "undefined") {
          localStorage.setItem("bouncer_access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("bouncer_refresh_token", refreshToken);
          }
          // Clear temporary OAuth storage
          sessionStorage.removeItem("oauth_code_verifier");
          sessionStorage.removeItem("oauth_state");
          sessionStorage.removeItem("oauth_redirect");
        }

        // Update API service and user state
        apiService.setToken(accessToken);
        setUser(user);
        return { success: true, user, redirectTo: storedRedirect };
      } else {
        setError(response.error || "Twitter authentication failed");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Twitter callback failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("bouncer_refresh_token")
          : null;
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiService.refreshToken(refreshToken);
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } =
          response.data as any;

        // Update tokens
        if (typeof window !== "undefined") {
          localStorage.setItem("bouncer_access_token", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("bouncer_refresh_token", newRefreshToken);
          }
        }

        apiService.setToken(accessToken);
        await checkAuth();
        return { success: true };
      } else {
        throw new Error(response.error || "Token refresh failed");
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      throw err;
    }
  };

  // Legacy auth methods (kept for backwards compatibility)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        const { token, user } = response.data as any;
        apiService.setToken(token);
        setUser(user);
        return { success: true };
      } else {
        setError(response.error || "Login failed");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    accountType: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.signup(
        email,
        password,
        name,
        accountType,
      );
      if (response.success && response.data) {
        const { token, user } = response.data as any;
        apiService.setToken(token);
        setUser(user);
        return { success: true };
      } else {
        setError(response.error || "Signup failed");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless
      setUser(null);
      apiService.clearToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("bouncer_access_token");
        localStorage.removeItem("bouncer_refresh_token");
        sessionStorage.clear();
      }
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    // Twitter OAuth methods
    initiateTwitterLogin,
    handleTwitterCallback,
    refreshAuth,
    // Legacy methods
    login,
    signup,
    logout,
  };
}
