"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallback,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <Loader2 className="w-8 h-8 text-primary animate-spin ml-3" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">
              Checking your authentication status
            </p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated - don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check role if required
  if (requiredRole && (!user?.role || user.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 mx-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have the required permissions to access this page.
            {requiredRole && (
              <span className="block mt-2 text-sm">
                Required role: <strong>{requiredRole}</strong>
              </span>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-transparent text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role - render children
  return <>{children}</>;
}
