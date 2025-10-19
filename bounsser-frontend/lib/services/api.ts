// Dynamic API service for backend integration

import { API_BASE_URL } from "@/lib/constants";
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  TwitterOAuthInitiateResponse,
  TwitterOAuthCallbackResponse,
} from "@/lib/types";

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Check for existing token in localStorage on initialization
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("bouncer_access_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("bouncer_access_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("bouncer_access_token");
      localStorage.removeItem("bouncer_refresh_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && this.token) {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("bouncer_refresh_token")
            : null;

        if (refreshToken) {
          try {
            const refreshResponse = await fetch(
              `${this.baseUrl}/auth/refresh`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              },
            );

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();

              // Update tokens
              this.setToken(refreshData.data.accessToken);
              if (
                refreshData.data.refreshToken &&
                typeof window !== "undefined"
              ) {
                localStorage.setItem(
                  "bouncer_refresh_token",
                  refreshData.data.refreshToken,
                );
              }

              // Retry original request
              return this.request(endpoint, options);
            }
          } catch (error) {
            console.error("Token refresh failed:", error);
            this.clearToken();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "An error occurred",
          message: data.message,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error("[Bouncer] API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Twitter OAuth Auth endpoints
  async initiateTwitterAuth(
    state?: string,
    redirect?: string,
  ): Promise<ApiResponse<TwitterOAuthInitiateResponse>> {
    const queryParams = new URLSearchParams();
    if (state) queryParams.append("state", state);
    if (redirect) queryParams.append("redirect", redirect);

    const endpoint = `/auth/twitter?${queryParams.toString()}`;
    console.log("[OAuth] Initiating Twitter auth:", {
      state,
      redirect,
      endpoint,
    });

    const response = await this.request<TwitterOAuthInitiateResponse>(endpoint);

    if (response.success && response.data) {
      console.log("[OAuth] Twitter auth initiation successful:", {
        hasAuthUrl: !!response.data.authUrl,
        hasCodeVerifier: !!response.data.codeVerifier,
        hasState: !!response.data.state,
      });
    } else {
      console.error("[OAuth] Twitter auth initiation failed:", response);
    }

    return response;
  }

  async handleTwitterCallback(
    code: string,
    codeVerifier: string,
    state?: string,
  ): Promise<ApiResponse<TwitterOAuthCallbackResponse>> {
    const queryParams = new URLSearchParams({ code });
    if (state) queryParams.append("state", state);

    const endpoint = `/auth/twitter/callback?${queryParams.toString()}`;
    console.log("[OAuth] Handling Twitter callback:", {
      hasCode: !!code,
      codeLength: code?.length,
      hasCodeVerifier: !!codeVerifier,
      codeVerifierLength: codeVerifier?.length,
      hasState: !!state,
      endpoint,
    });

    const response = await this.request<TwitterOAuthCallbackResponse>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify({ codeVerifier }),
      },
    );

    if (response.success && response.data) {
      console.log("[OAuth] Twitter callback successful:", {
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user,
        username: response.data.user?.username,
      });
    } else {
      console.error("[OAuth] Twitter callback failed:", {
        success: response.success,
        error: response.error,
        message: response.message,
      });
    }

    return response;
  }

  async refreshToken(refreshToken: string) {
    return this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  async verifyToken(token: string) {
    return this.request("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async getAuthStatus() {
    return this.request("/auth/status");
  }

  // Legacy auth methods (kept for backwards compatibility)
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(
    email: string,
    password: string,
    name: string,
    accountType: string,
  ) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, accountType }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request("/user/me");
  }

  async updateUser(data: any) {
    return this.request("/user/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Social accounts endpoints
  async getSocialAccounts() {
    return this.request("/social-accounts");
  }

  async connectSocialAccount(platform: string, authCode: string) {
    return this.request("/social-accounts/connect", {
      method: "POST",
      body: JSON.stringify({ platform, authCode }),
    });
  }

  async disconnectSocialAccount(accountId: string) {
    return this.request(`/social-accounts/${accountId}`, {
      method: "DELETE",
    });
  }

  // Events endpoints
  async getEvents(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/events?${queryParams}`);
  }

  async getEventById(id: string) {
    return this.request(`/events/${id}`);
  }

  async reviewEvent(id: string, action: "confirm" | "dismiss", notes?: string) {
    return this.request(`/events/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ action, notes }),
    });
  }

  // Flags endpoints
  async getFlags(params?: { page?: number; pageSize?: number }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/flags?${queryParams}`);
  }

  // Notifications endpoints
  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(
      `/notifications?${queryParams}`,
    );
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: "POST" });
  }

  async markAllNotificationsAsRead() {
    return this.request("/notifications/read-all", { method: "POST" });
  }

  // Stream rules endpoints
  async getStreamRules() {
    return this.request("/stream-rules");
  }

  async createStreamRule(data: { type: string; value: string }) {
    return this.request("/stream-rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteStreamRule(id: string) {
    return this.request(`/stream-rules/${id}`, { method: "DELETE" });
  }

  // Analytics endpoints
  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/analytics?${queryParams}`);
  }

  // Settings endpoints
  async getSettings() {
    return this.request("/settings");
  }

  async updateSettings(data: any) {
    return this.request("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Organization endpoints
  async getOrganization() {
    return this.request("/organization");
  }

  async getTeamMembers() {
    return this.request("/organization/team");
  }

  async inviteTeamMember(email: string, role: string) {
    return this.request("/organization/team/invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  async removeTeamMember(userId: string) {
    return this.request(`/organization/team/${userId}`, { method: "DELETE" });
  }
}

export const apiService = new ApiService();
