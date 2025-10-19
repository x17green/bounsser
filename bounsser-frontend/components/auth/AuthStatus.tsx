"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Shield, User, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuthStatusProps {
  className?: string;
  showDetails?: boolean;
}

export default function AuthStatus({
  className = "",
  showDetails = false,
}: AuthStatusProps) {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  if (!showDetails && process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Authentication Status
          {process.env.NODE_ENV === "development" && (
            <Badge variant="secondary" className="text-xs">
              DEBUG
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking authentication...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            Error: {error}
          </div>
        )}

        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge
            variant={isAuthenticated ? "default" : "secondary"}
            className={isAuthenticated ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </div>

        {/* User Information */}
        {isAuthenticated && user && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">User Info</span>
            </div>

            <div className="pl-6 space-y-1 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Username:</span> @{user.username}
              </div>
              {user.profile?.name && (
                <div>
                  <span className="font-medium">Name:</span> {user.profile.name}
                </div>
              )}
              {user.xId && (
                <div>
                  <span className="font-medium">X ID:</span> {user.xId}
                </div>
              )}
              {user.role && (
                <div>
                  <span className="font-medium">Role:</span> {user.role}
                </div>
              )}
              {user.profile?.verified && (
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-600">Verified Account</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Token Status */}
        {showDetails && typeof window !== "undefined" && (
          <div className="space-y-1 pt-2 border-t text-xs">
            <div className="font-medium text-muted-foreground">
              Token Status:
            </div>
            <div className="pl-2 space-y-1">
              <div>
                Access Token:{" "}
                {localStorage.getItem("bouncer_access_token") ? "✓" : "✗"}
              </div>
              <div>
                Refresh Token:{" "}
                {localStorage.getItem("bouncer_refresh_token") ? "✓" : "✗"}
              </div>
            </div>
          </div>
        )}

        {/* OAuth Session Storage */}
        {showDetails && typeof window !== "undefined" && (
          <div className="space-y-1 pt-2 border-t text-xs">
            <div className="font-medium text-muted-foreground">
              OAuth Session:
            </div>
            <div className="pl-2 space-y-1">
              <div>
                Code Verifier:{" "}
                {sessionStorage.getItem("oauth_code_verifier") ? "✓" : "✗"}
              </div>
              <div>
                State: {sessionStorage.getItem("oauth_state") ? "✓" : "✗"}
              </div>
              <div>
                Redirect: {sessionStorage.getItem("oauth_redirect") ? "✓" : "✗"}
              </div>
            </div>
          </div>
        )}

        {/* Environment Info */}
        {showDetails && (
          <div className="space-y-1 pt-2 border-t text-xs">
            <div className="font-medium text-muted-foreground">
              Environment:
            </div>
            <div className="pl-2 space-y-1">
              <div>
                API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "Not set"}
              </div>
              <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || "Not set"}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
